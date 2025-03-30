const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Debugging: Ensure environment variables are loaded
if (
  !process.env.PRIVATE_KEY ||
  !process.env.SEPOLIA_RPC_URL ||
  !process.env.CONTRACT_ADDRESS
) {
  console.error("❌ Missing environment variables. Check your .env file.");
  process.exit(1);
}

// Load environment variables
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

// Validate private key
const privateKey = process.env.PRIVATE_KEY.trim();
if (!ethers.isHexString(privateKey) || privateKey.length !== 66) {
  console.error(
    "❌ Invalid PRIVATE_KEY format. Ensure it's a valid 66-character hex string (including 0x)."
  );
  process.exit(1);
}

// Initialize wallet and contract
const wallet = new ethers.Wallet(privateKey, provider);
const NFTGiftMarketplace = require("./artifacts/contracts/GiftCard.sol/NFTGiftMarketplace.json");
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(
  contractAddress,
  NFTGiftMarketplace.abi,
  wallet
);

console.log(`✅ Connected to contract at ${contractAddress}`);

// Helper function to handle errors
const handleError = (error, res) => {
  console.error("❌ Error:", error);

  if (error.code === "INSUFFICIENT_FUNDS") {
    return res.status(400).json({
      success: false,
      error: `Insufficient funds. Please try with a smaller amount or get more Sepolia ETH from a faucet.`,
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

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "NFTGiftMarketplace API is running",
    endpoints: {
      mintGiftCard: {
        method: "POST",
        url: "/api/giftcard/mint",
        body: {
          tokenURI: "string (IPFS URI)",
          price: "string (in ETH)",
        },
      },
      buyGiftCard: {
        method: "POST",
        url: "/api/giftcard/buy",
        body: {
          tokenId: "number",
          message: "string (optional)",
          price: "string (in ETH)",
        },
      },
      setSecretKey: {
        method: "POST",
        url: "/api/giftcard/set-secret",
        body: {
          tokenId: "number",
          secret: "string",
        },
      },
      claimGiftCard: {
        method: "POST",
        url: "/api/giftcard/claim",
        body: {
          tokenId: "number",
          secret: "string",
        },
      },
      getGiftCard: {
        method: "GET",
        url: "/api/giftcard/:tokenId",
      },
    },
    contractAddress: contractAddress,
    network: "Sepolia Testnet",
  });
});

// Mint Gift Card endpoint
app.post("/api/giftcard/mint", async (req, res) => {
  try {
    const { tokenURI, price } = req.body;

    if (!tokenURI || !price) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: tokenURI and price are required.",
      });
    }

    console.log("🔹 Minting Gift Card with:", { tokenURI, price });

    const tx = await contract.mintGiftCard(tokenURI, ethers.parseEther(price));
    const receipt = await tx.wait();

    // Debugging: Log the entire transaction receipt
    console.log("Transaction Receipt:", receipt);

    // Safely extract the tokenId from the GiftCardMinted event
    const event = receipt.events?.find((e) => e.event === "GiftCardMinted");
    if (!event) {
      console.error(
        "❌ GiftCardMinted event not found in transaction receipt:",
        receipt
      );
      return res.status(500).json({
        success: false,
        error: "GiftCardMinted event not found in transaction receipt.",
      });
    }

    const tokenId = event.args.tokenId.toString();

    console.log("✅ Gift Card Minted:", { transactionHash: tx.hash, tokenId });
    res.json({ success: true, transactionHash: tx.hash, tokenId });
  } catch (error) {
    console.error("❌ Error minting gift card:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An unknown error occurred.",
    });
  }
});

// Buy Gift Card endpoint
app.post("/api/giftcard/buy", async (req, res) => {
  try {
    const { tokenId, message, price } = req.body;

    if (!tokenId || !price) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: tokenId and price are required.",
      });
    }

    console.log("🔹 Buying Gift Card:", { tokenId, message, price });

    const tx = await contract.buyGiftCard(tokenId, message || "", {
      value: ethers.parseEther(price),
    });
    const receipt = await tx.wait();

    console.log("✅ Gift Card Purchased:", { transactionHash: tx.hash });
    res.json({ success: true, transactionHash: tx.hash });
  } catch (error) {
    handleError(error, res);
  }
});

// Set Secret Key endpoint
app.post("/api/giftcard/set-secret", async (req, res) => {
  try {
    const { tokenId, secret } = req.body;

    if (!tokenId || !secret) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: tokenId and secret are required.",
      });
    }

    console.log("🔹 Setting Secret Key for Gift Card:", { tokenId, secret });

    const tx = await contract.setSecretKey(tokenId, secret);
    const receipt = await tx.wait();

    console.log("✅ Secret Key Set:", { transactionHash: tx.hash });
    res.json({ success: true, transactionHash: tx.hash });
  } catch (error) {
    handleError(error, res);
  }
});

// Claim Gift Card endpoint
app.post("/api/giftcard/claim", async (req, res) => {
  try {
    const { tokenId, secret } = req.body;

    if (!tokenId || !secret) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: tokenId and secret are required.",
      });
    }

    console.log("🔹 Claiming Gift Card:", { tokenId, secret });

    const tx = await contract.claimGiftCard(tokenId, secret);
    const receipt = await tx.wait();

    console.log("✅ Gift Card Claimed:", { transactionHash: tx.hash });
    res.json({ success: true, transactionHash: tx.hash });
  } catch (error) {
    handleError(error, res);
  }
});

// Get Gift Card Details endpoint
app.get("/api/giftcard/:tokenId", async (req, res) => {
  try {
    const { tokenId } = req.params;

    if (!tokenId || isNaN(tokenId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid token ID." });
    }

    console.log("🔹 Fetching Gift Card Details for:", tokenId);

    const giftCard = await contract.giftCards(tokenId);

    res.json({
      success: true,
      data: {
        creator: giftCard.creator,
        currentOwner: giftCard.currentOwner,
        price: ethers.formatEther(giftCard.price),
        forSale: giftCard.forSale,
        message: giftCard.message,
        secretHash: giftCard.secretHash,
      },
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Something broke! Please try again later.",
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API Documentation available at http://localhost:${PORT}`);
});
