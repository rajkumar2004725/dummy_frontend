const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const path = require("path");
require("dotenv").config();
const { Sequelize, Op } = require("sequelize");

// Import models
const Background = require("./src/models/Background");
const GiftCard = require("./src/models/GiftCard");
const Transaction = require("./src/models/Transaction");
const User = require("./src/models/User");

const app = express();

const corsOptions = {
  origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));
app.use(express.json());

// Load environment variables and setup blockchain connection
if (!process.env.PRIVATE_KEY || !process.env.SEPOLIA_RPC_URL || !process.env.CONTRACT_ADDRESS) {
  console.error("❌ Missing environment variables. Check your .env file.");
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const privateKey = process.env.PRIVATE_KEY.trim();
if (!ethers.isHexString(privateKey) || privateKey.length !== 66) {
  console.error("❌ Invalid PRIVATE_KEY format. Ensure it's a valid 66-character hex string (including 0x).");
  process.exit(1);
}

const wallet = new ethers.Wallet(privateKey, provider);
const NFTGiftMarketplace = require("./artifacts/contracts/GiftCard.sol/NFTGiftMarketplace.json");
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, NFTGiftMarketplace.abi, wallet);

console.log(`✅ Connected to contract at ${contractAddress}`);

const handleError = (error, res) => {
  console.error("❌ Error:", error);
  if (error.code === "INSUFFICIENT_FUNDS") {
    return res.status(400).json({
      success: false,
      error: "Insufficient funds. Please try with a smaller amount or get more Sepolia ETH.",
    });
  }
  if (error.code === "NETWORK_ERROR") {
    return res.status(503).json({
      success: false,
      error: "Network error. Please check your connection and try again.",
    });
  }
  return res.status(500).json({
    success: false,
    error: error.message || "An unexpected error occurred.",
  });
};

// API Status endpoint
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "NFTGiftMarketplace API is running",
    contractAddress,
    network: "Sepolia Testnet",
  });
});

// Mint Background
app.post("/api/background/mint", async (req, res) => {
  try {
    const { imageURI, category } = req.body;
    if (!imageURI || !category) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: imageURI and category are required.",
      });
    }

    console.log("🔹 Minting Background:", { imageURI, category });
    const tx = await contract.mintBackground(imageURI, category);
    const receipt = await tx.wait();
    console.log("🔍 Transaction Receipt:", receipt);

    const event = receipt.logs.find(
      (log) => log.fragment && log.fragment.name === "BackgroundMinted"
    );
    if (!event) {
      return res.status(500).json({
        success: false,
        error: "BackgroundMinted event not found in transaction receipt.",
      });
    }
    const backgroundId = event.args.backgroundId.toString();

    // Save to database using the blockchain ID
    const background = await Background.create({
      id: backgroundId, // Use blockchain ID
      artistAddress: wallet.address,
      imageURI,
      category
    });

    console.log(`✅ Background Minted and Saved to DB - ID: ${backgroundId}`);
    await updateUserStats(wallet.address);
    res.json({ 
      success: true, 
      transactionHash: tx.hash, 
      backgroundId
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Helper function for pagination
function getPaginationParams(req) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  return { limit, offset, page };
}

// Get All Backgrounds with Pagination
app.get("/api/backgrounds", async (req, res) => {
  try {
    const { limit, offset, page } = getPaginationParams(req);
    const { category } = req.query;

    const whereClause = category ? { category } : {};

    const { count, rows: backgrounds } = await Background.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      backgrounds,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Get Background by ID
app.get("/api/background/:id", async (req, res) => {
  try {
    const background = await Background.findByPk(req.params.id);
    if (!background) {
      return res.status(404).json({
        success: false,
        error: "Background not found"
      });
    }
    res.json({ success: true, background });
  } catch (error) {
    handleError(error, res);
  }
});

// Create Gift Card
app.post("/api/giftcard/create", async (req, res) => {
  try {
    const { backgroundId, price, message } = req.body;
    if (!backgroundId || !price) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: backgroundId and price are required.",
      });
    }

    // First verify the background exists in database
    const background = await Background.findByPk(backgroundId);
    if (!background) {
      return res.status(404).json({
        success: false,
        error: "Background not found with the given ID.",
      });
    }

    console.log("🔹 Creating Gift Card:", { backgroundId, price, message });
    const tx = await contract.createGiftCard(backgroundId, ethers.parseEther(price), message);
    const receipt = await tx.wait();
    console.log("🔍 Transaction Receipt:", receipt);

    const event = receipt.logs.find(
      (log) => log.fragment && log.fragment.name === "GiftCardCreated"
    );
    if (!event) {
      return res.status(500).json({
        success: false,
        error: "GiftCardCreated event not found in transaction receipt.",
      });
    }
    const giftCardId = event.args.giftCardId.toString();

    // Increment background usage count
    await background.increment('usageCount');
    await background.save();

    // Save to database using Sequelize
    const giftCard = await GiftCard.create({
      id: giftCardId, // Use blockchain ID
      backgroundId,
      price: ethers.formatEther(event.args.price),
      message,
      isClaimable: true,
      creatorAddress: event.args.creator,
      currentOwner: event.args.creator,
      transactionHash: receipt.hash,
    });

    res.json({
      success: true,
      transactionHash: receipt.hash,
      giftCardId,
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Get All Gift Cards with Pagination and Filters
app.get("/api/giftcards", async (req, res) => {
  try {
    const { limit, offset, page } = getPaginationParams(req);
    const { status, minPrice, maxPrice } = req.query;

    const whereClause = {};
    if (status) {
      whereClause.isClaimable = status === 'available';
    }
    if (minPrice) {
      whereClause.price = {
        ...whereClause.price,
        [Op.gte]: parseFloat(minPrice)
      };
    }
    if (maxPrice) {
      whereClause.price = {
        ...whereClause.price,
        [Op.lte]: parseFloat(maxPrice)
      };
    }

    const { count, rows: giftCards } = await GiftCard.findAndCountAll({
      where: whereClause,
      include: [{ model: Background }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      giftCards,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Get Gift Card by ID
app.get("/api/giftcard/:id", async (req, res) => {
  try {
    const giftCard = await GiftCard.findByPk(req.params.id, {
      include: [{ model: Background }]
    });
    if (!giftCard) {
      return res.status(404).json({
        success: false,
        error: "Gift Card not found"
      });
    }
    res.json({ success: true, giftCard });
  } catch (error) {
    handleError(error, res);
  }
});

// Get All Gift Cards by Owner
app.get("/api/giftcards/owner/:address", async (req, res) => {
  try {
    const giftCards = await GiftCard.findAll({
      where: { currentOwner: req.params.address },
      include: [{ model: Background }]
    });
    res.json({ success: true, giftCards });
  } catch (error) {
    handleError(error, res);
  }
});

// Get All Gift Cards by Creator
app.get("/api/giftcards/creator/:address", async (req, res) => {
  try {
    const giftCards = await GiftCard.findAll({
      where: { creatorAddress: req.params.address },
      include: [{ model: Background }]
    });
    res.json({ success: true, giftCards });
  } catch (error) {
    handleError(error, res);
  }
});

// Transfer Gift Card
app.post("/api/giftcard/transfer", async (req, res) => {
  try {
    const { giftCardId, recipient } = req.body;
    if (!giftCardId || !recipient) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: giftCardId and recipient are required.",
      });
    }

    const tx = await contract.transferGiftCard(giftCardId, recipient);
    const receipt = await tx.wait();

    // Update database
    const giftCard = await GiftCard.findByPk(giftCardId);
    if (giftCard) {
      await giftCard.update({ currentOwner: recipient });
      
      // Record transaction
      await Transaction.create({
        giftCardId,
        fromAddress: wallet.address,
        toAddress: recipient,
        transactionType: 'TRANSFER',
        amount: 0
      });
    }

    await Promise.all([
      updateUserStats(wallet.address),
      updateUserStats(recipient)
    ]);
    res.json({ success: true, transactionHash: tx.hash });
  } catch (error) {
    handleError(error, res);
  }
});

// Buy Gift Card
app.post("/api/giftcard/buy", async (req, res) => {
  try {
    const { giftCardId, message, price } = req.body;
    if (!giftCardId || !price) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: giftCardId and price are required.",
      });
    }

    const tx = await contract.buyGiftCard(giftCardId, message, { value: ethers.parseEther(price) });
    const receipt = await tx.wait();

    // Update database
    const giftCard = await GiftCard.findByPk(giftCardId);
    if (giftCard) {
      await giftCard.update({
        currentOwner: wallet.address,
        message: message || giftCard.message
      });

      // Record transaction
      await Transaction.create({
        giftCardId,
        fromAddress: giftCard.creatorAddress,
        toAddress: wallet.address,
        transactionType: 'PURCHASE',
        amount: price
      });
    }

    await Promise.all([
      updateUserStats(wallet.address),
      updateUserStats(giftCard.currentOwner)
    ]);
    res.json({ success: true, transactionHash: tx.hash });
  } catch (error) {
    handleError(error, res);
  }
});

// Get All Transactions for a Gift Card
app.get("/api/giftcard/:id/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { giftCardId: req.params.id },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, transactions });
  } catch (error) {
    handleError(error, res);
  }
});

// Set Secret Key
app.post("/api/giftcard/set-secret", async (req, res) => {
  try {
    const { giftCardId, secret } = req.body;
    if (!giftCardId || !secret) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: giftCardId and secret are required.",
      });
    }

    console.log("🔹 Setting Secret Key:", { giftCardId });
    const tx = await contract.setSecretKey(giftCardId, secret);
    const receipt = await tx.wait();
    console.log("🔍 Transaction Receipt:", receipt);

    // Update database
    const giftCard = await GiftCard.findByPk(giftCardId);
    if (giftCard) {
      await giftCard.update({
        secretHash: secret,
        isClaimable: true
      });
    }

    res.json({ success: true, transactionHash: tx.hash });
  } catch (error) {
    handleError(error, res);
  }
});

// Claim Gift Card
app.post("/api/giftcard/claim", async (req, res) => {
  try {
    const { giftCardId, secret } = req.body;
    if (!giftCardId || !secret) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: giftCardId and secret are required.",
      });
    }

    console.log("🔹 Claiming Gift Card:", { giftCardId });
    const tx = await contract.claimGiftCard(giftCardId, secret);
    const receipt = await tx.wait();
    console.log("🔍 Transaction Receipt:", receipt);

    // Find the GiftCardClaimed event
    const event = receipt.logs.find(
      (log) => log.fragment && log.fragment.name === "GiftCardClaimed"
    );
    if (!event) {
      return res.status(500).json({
        success: false,
        error: "GiftCardClaimed event not found in transaction receipt.",
      });
    }

    // Update database
    const giftCard = await GiftCard.findByPk(giftCardId);
    if (giftCard) {
      await giftCard.update({
        currentOwner: wallet.address,
        isClaimable: false,
        secretHash: null
      });

      // Record transaction
      await Transaction.create({
        giftCardId,
        fromAddress: giftCard.creatorAddress,
        toAddress: wallet.address,
        transactionType: 'CLAIM',
        amount: 0
      });
    }

    await Promise.all([
      updateUserStats(wallet.address),
      updateUserStats(giftCard.creatorAddress)
    ]);
    res.json({ success: true, transactionHash: tx.hash });
  } catch (error) {
    handleError(error, res);
  }
});

// Helper function to update user statistics
async function updateUserStats(walletAddress) {
  const user = await User.findOne({ where: { walletAddress } });
  if (!user) return;

  const [createdCount, sentCount, receivedCount, mintedCount] = await Promise.all([
    GiftCard.count({ where: { creatorAddress: walletAddress } }),
    Transaction.count({ 
      where: { 
        fromAddress: walletAddress,
        transactionType: 'TRANSFER'
      }
    }),
    Transaction.count({ 
      where: { 
        toAddress: walletAddress,
        transactionType: 'TRANSFER'
      }
    }),
    Background.count({ where: { artistAddress: walletAddress } })
  ]);

  await user.update({
    totalGiftCardsCreated: createdCount,
    totalGiftCardsSent: sentCount,
    totalGiftCardsReceived: receivedCount,
    totalBackgroundsMinted: mintedCount,
    lastLoginAt: new Date()
  });
}

// User Registration/Update
app.post("/api/user", async (req, res) => {
  try {
    const { walletAddress, username, email, bio, profileImageUrl } = req.body;
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: "Wallet address is required"
      });
    }

    // Try to find existing user
    let user = await User.findOne({ where: { walletAddress } });
    
    if (user) {
      // Update existing user
      await user.update({
        username: username || user.username,
        email: email || user.email,
        bio: bio || user.bio,
        profileImageUrl: profileImageUrl || user.profileImageUrl,
        lastLoginAt: new Date()
      });
    } else {
      // Create new user
      user = await User.create({
        walletAddress,
        username,
        email,
        bio,
        profileImageUrl,
        lastLoginAt: new Date()
      });
    }

    // Update user statistics
    await updateUserStats(walletAddress);

    // Get updated user data
    user = await User.findOne({ where: { walletAddress } });

    res.json({ 
      success: true, 
      user,
      message: user ? "User updated successfully" : "User created successfully"
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Get User Profile with Detailed Statistics
app.get("/api/user/:walletAddress", async (req, res) => {
  try {
    const user = await User.findOne({
      where: { walletAddress: req.params.walletAddress }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Get all data in parallel
    const [
      createdGiftCards,
      ownedGiftCards,
      mintedBackgrounds,
      sentTransactions,
      receivedTransactions
    ] = await Promise.all([
      // Gift cards created by user
      GiftCard.findAll({
        where: { creatorAddress: req.params.walletAddress },
        include: [{ model: Background }]
      }),
      // Gift cards currently owned by user
      GiftCard.findAll({
        where: { currentOwner: req.params.walletAddress },
        include: [{ model: Background }]
      }),
      // Backgrounds minted by user
      Background.findAll({
        where: { artistAddress: req.params.walletAddress }
      }),
      // Gift card transfers sent by user
      Transaction.findAll({
        where: { 
          fromAddress: req.params.walletAddress,
          transactionType: 'TRANSFER'
        },
        include: [{ 
          model: GiftCard,
          include: [{ model: Background }]
        }]
      }),
      // Gift card transfers received by user
      Transaction.findAll({
        where: { 
          toAddress: req.params.walletAddress,
          transactionType: 'TRANSFER'
        },
        include: [{ 
          model: GiftCard,
          include: [{ model: Background }]
        }]
      })
    ]);

    // Calculate statistics
    const stats = {
      totalGiftCardsCreated: createdGiftCards.length,
      totalBackgroundsMinted: mintedBackgrounds.length,
      totalGiftCardsSent: sentTransactions.length,
      totalGiftCardsReceived: receivedTransactions.length,
      currentlyOwnedGiftCards: ownedGiftCards.length
    };

    // Format transfer history
    const transferHistory = {
      sent: sentTransactions.map(tx => ({
        transactionId: tx.id,
        giftCardId: tx.giftCardId,
        recipient: tx.toAddress,
        timestamp: tx.createdAt,
        giftCard: tx.GiftCard
      })),
      received: receivedTransactions.map(tx => ({
        transactionId: tx.id,
        giftCardId: tx.giftCardId,
        sender: tx.fromAddress,
        timestamp: tx.createdAt,
        giftCard: tx.GiftCard
      }))
    };

    res.json({
      success: true,
      user,
      stats,
      details: {
        mintedBackgrounds,
        createdGiftCards,
        ownedGiftCards,
        transferHistory
      }
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Delete User
app.delete("/api/user/:walletAddress", async (req, res) => {
  try {
    const user = await User.findOne({
      where: { walletAddress: req.params.walletAddress }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    await user.destroy();
    res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Get Top Users by Activity
app.get("/api/users/top", async (req, res) => {
  try {
    const users = await User.findAll({
      order: [
        ['totalGiftCardsCreated', 'DESC'],
        ['totalBackgroundsMinted', 'DESC']
      ],
      limit: 10
    });
    res.json({ success: true, users });
  } catch (error) {
    handleError(error, res);
  }
});

// Get Backgrounds by Category
app.get("/api/backgrounds/category/:category", async (req, res) => {
  try {
    const backgrounds = await Background.findAll({
      where: { category: req.params.category },
      include: [{
        model: User,
        attributes: ['username', 'walletAddress', 'profileImageUrl']
      }]
    });
    res.json({ success: true, backgrounds });
  } catch (error) {
    handleError(error, res);
  }
});

// Get Popular Backgrounds
app.get("/api/backgrounds/popular", async (req, res) => {
  try {
    const backgrounds = await Background.findAll({
      order: [['usageCount', 'DESC']],
      limit: 10,
      include: [{
        model: User,
        attributes: ['username', 'walletAddress', 'profileImageUrl']
      }]
    });
    res.json({ success: true, backgrounds });
  } catch (error) {
    handleError(error, res);
  }
});

// Get Recent Gift Card Transactions
app.get("/api/transactions/recent", async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      order: [['createdAt', 'DESC']],
      limit: 20,
      include: [{
        model: GiftCard,
        include: [{ model: Background }]
      }]
    });
    res.json({ success: true, transactions });
  } catch (error) {
    handleError(error, res);
  }
});

// Search Users
app.get("/api/users/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Search query is required"
      });
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
          { walletAddress: { [Op.iLike]: `%${query}%` } }
        ]
      },
      limit: 10
    });
    res.json({ success: true, users });
  } catch (error) {
    handleError(error, res);
  }
});

// Get User Activity Feed
app.get("/api/users/:walletAddress/activity", async (req, res) => {
  try {
    const activities = await Transaction.findAll({
      where: {
        [Op.or]: [
          { fromAddress: req.params.walletAddress },
          { toAddress: req.params.walletAddress }
        ]
      },
      order: [['createdAt', 'DESC']],
      limit: 20,
      include: [{
        model: GiftCard,
        include: [{ model: Background }]
      }]
    });

    const formattedActivities = activities.map(activity => {
      const isOutgoing = activity.fromAddress === req.params.walletAddress;
      return {
        id: activity.id,
        type: activity.transactionType,
        direction: isOutgoing ? 'outgoing' : 'incoming',
        timestamp: activity.createdAt,
        giftCard: activity.GiftCard,
        otherParty: isOutgoing ? activity.toAddress : activity.fromAddress,
        amount: activity.amount
      };
    });

    res.json({ success: true, activities: formattedActivities });
  } catch (error) {
    handleError(error, res);
  }
});

// Get All Users with Pagination
app.get("/api/users", async (req, res) => {
  try {
    const { limit, offset, page } = getPaginationParams(req);
    const { sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;

    const validSortFields = ['createdAt', 'totalGiftCardsCreated', 'totalBackgroundsMinted'];
    const validSortOrders = ['ASC', 'DESC'];

    if (!validSortFields.includes(sortBy) || !validSortOrders.includes(sortOrder.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: "Invalid sort parameters"
      });
    }

    const { count, rows: users } = await User.findAndCountAll({
      limit,
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
      attributes: {
        exclude: ['email'] // Don't expose emails in the list
      }
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Get Recent Transactions
app.get("/api/transactions/recent", async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10,
      include: [
        {
          model: GiftCard,
          include: [{ model: Background }]
        }
      ]
    });
    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Get Top Users
app.get("/api/users/top", async (req, res) => {
  try {
    const users = await User.findAll({
      order: [
        ['totalGiftCardsCreated', 'DESC'],
        ['totalBackgroundsMinted', 'DESC']
      ],
      limit: 10,
      attributes: {
        exclude: ['email']
      }
    });
    res.json({
      success: true,
      users
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Search Users
app.get("/api/users/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Search query is required"
      });
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.iLike]: `%${query}%` } },
          { walletAddress: { [Op.iLike]: `%${query}%` } }
        ]
      },
      attributes: {
        exclude: ['email']
      }
    });
    res.json({
      success: true,
      users
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Get User Activity
app.get("/api/users/:walletAddress/activity", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const user = await User.findOne({
      where: { walletAddress },
      include: [
        {
          model: Transaction,
          as: 'transactions',
          include: [
            {
              model: GiftCard,
              include: [{ model: Background }]
            }
          ],
          order: [['createdAt', 'DESC']],
          limit: 20
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.json({
      success: true,
      activity: user.transactions
    });
  } catch (error) {
    handleError(error, res);
  }
});

app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
