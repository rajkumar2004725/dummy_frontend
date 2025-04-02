const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const path = require("path");
require("dotenv").config();

const app = express();

const corsOptions = {
  origin: ["http://localhost:8080", "http://127.0.0.1:8080"], // Frontend dev server
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));
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
const privateKey = process.env.PRIVATE_KEY.trim();
if (!ethers.isHexString(privateKey) || privateKey.length !== 66) {
  console.error(
    "❌ Invalid PRIVATE_KEY format. Ensure it's a valid 66-character hex string (including 0x). "
  );
  process.exit(1);
}

const wallet = new ethers.Wallet(privateKey, provider);
const NFTGiftMarketplace = require("./artifacts/contracts/GiftCard.sol/NFTGiftMarketplace.json");
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(
  contractAddress,
  NFTGiftMarketplace.abi,
  wallet
);

console.log(`✅ Connected to contract at ${contractAddress}`);

const handleError = (error, res) => {
  console.error("❌ Error:", error);
  if (error.code === "INSUFFICIENT_FUNDS") {
    return res.status(400).json({
      success: false,
      error:
        "Insufficient funds. Please try with a smaller amount or get more Sepolia ETH.",
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

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "NFTGiftMarketplace API is running",
    contractAddress,
    network: "Sepolia Testnet",
  });
});

// Mint Gift Card
app.post("/api/giftcard/mint", async (req, res) => {
  try {
    const { tokenURI, price } = req.body;
    if (!tokenURI || !price) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: tokenURI and price are required.",
      });
    }
    console.log("🔹 Minting Gift Card:", { tokenURI, price });
    const tx = await contract.mintGiftCard(tokenURI, ethers.parseEther(price));
    const receipt = await tx.wait();
    console.log("🔍 Transaction Receipt:", receipt);

    const event = receipt.logs.find(
      (log) => log.fragment && log.fragment.name === "GiftCardMinted"
    );
    if (!event) {
      return res.status(500).json({
        success: false,
        error: "GiftCardMinted event not found in transaction receipt.",
      });
    }
    const tokenId = event.args.tokenId.toString();
    console.log(`✅ Gift Card Minted - Token ID: ${tokenId}`);
    res.json({ success: true, transactionHash: tx.hash, tokenId });
  } catch (error) {
    handleError(error, res);
  }
});

// Buy Gift Card
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
    const tx = await contract.buyGiftCard(tokenId, message, {
      value: ethers.parseEther(price),
    });
    const receipt = await tx.wait();
    console.log("🔍 Transaction Receipt:", receipt);
    res.json({ success: true, transactionHash: tx.hash });
  } catch (error) {
    handleError(error, res);
  }
});

// Set Secret Key
app.post("/api/giftcard/set-secret", async (req, res) => {
  try {
    const { tokenId, secret } = req.body;
    if (!tokenId || !secret) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: tokenId and secret are required.",
      });
    }
    console.log("🔹 Setting Secret Key:", { tokenId, secret });
    const tx = await contract.setSecretKey(tokenId, secret);
    const receipt = await tx.wait();
    console.log("🔍 Transaction Receipt:", receipt);
    res.json({ success: true, transactionHash: tx.hash });
  } catch (error) {
    handleError(error, res);
  }
});

// Claim Gift Card
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
    console.log("🔍 Transaction Receipt:", receipt);
    res.json({ success: true, transactionHash: tx.hash });
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
