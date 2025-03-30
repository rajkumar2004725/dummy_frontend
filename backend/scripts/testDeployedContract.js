require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  // Load environment variables
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  // ABI of the deployed contract
  const abi = [
    "event GiftCardMinted(uint256 indexed tokenId, address indexed creator, uint256 price)",
    "function mintGiftCard(string memory _tokenURI, uint256 price) external",
    "function buyGiftCard(uint256 tokenId, string memory message) external payable",
    "function setSecretKey(uint256 tokenId, string memory secret) external",
    "function claimGiftCard(uint256 tokenId, string memory secret) external",
    "function giftCards(uint256 tokenId) public view returns (address creator, address currentOwner, uint256 price, bool forSale, string memory message, bytes32 secretHash)",
  ];

  // Connect to Sepolia testnet
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, abi, wallet);

  // Check wallet balance
  const balance = await provider.getBalance(wallet.address);
  console.log("Wallet Balance:", ethers.formatEther(balance), "ETH");

  // Use the hardcoded tokenId for the 5th card
  const tokenId = 8;
  console.log(`Using hardcoded Token ID: ${tokenId}`);

  // Step 1: Fetch the gift card price
  console.log("Fetching gift card details...");
  const giftCard = await contract.giftCards(tokenId); // Use the hardcoded tokenId
  const price = giftCard.price; // Price in wei
  console.log("Gift Card Price:", ethers.formatEther(price), "ETH");

  // Step 2: Buy the gift card
  console.log("Buying the gift card...");
  const buyTx = await contract.buyGiftCard(tokenId, "Happy Birthday!", {
    value: price, // Use the fetched price
  });
  await buyTx.wait();
  console.log("✅ Gift card purchased!");

  // Step 3: Set a secret key for the gift card
  console.log("Setting a secret key...");
  const setSecretTx = await contract.setSecretKey(tokenId, "my-secret-key");
  await setSecretTx.wait();
  console.log("✅ Secret key set!");

  // Step 4: Claim the gift card using the secret key
  console.log("Claiming the gift card...");
  const claimTx = await contract.claimGiftCard(tokenId, "my-secret-key");
  await claimTx.wait();
  console.log("✅ Gift card claimed!");

  // Step 5: Fetch and log the gift card details
  console.log("Fetching gift card details...");
  const updatedGiftCard = await contract.giftCards(tokenId);
  console.log("Gift Card Details:");
  console.log({
    creator: updatedGiftCard.creator,
    currentOwner: updatedGiftCard.currentOwner,
    price: ethers.formatEther(updatedGiftCard.price),
    forSale: updatedGiftCard.forSale,
    message: updatedGiftCard.message,
    secretHash: updatedGiftCard.secretHash,
  });
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
});
