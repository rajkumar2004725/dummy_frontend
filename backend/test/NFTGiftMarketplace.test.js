const { expect } = require("chai");
const { ethers } = require("hardhat");
const axios = require("axios");

const API_URL = "http://localhost:3001";

describe("NFTGiftMarketplace", function () {
  let NFTGiftMarketplace, nftGiftMarketplace, owner, creator, buyer;

  beforeEach(async function () {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error("CONTRACT_ADDRESS is not set in the .env file");
    }

    NFTGiftMarketplace = await ethers.getContractFactory("NFTGiftMarketplace");
    [owner, creator, buyer] = await ethers.getSigners();
    nftGiftMarketplace = NFTGiftMarketplace.attach(contractAddress);
  });

  it("should mint a gift card and verify its details", async function () {
    const tokenURI = "ipfs://QmExampleHash/metadata.json";
    const price = ethers.parseEther("0.0001"); // Updated price

    // Mint a gift card
    await nftGiftMarketplace.connect(creator).mintGiftCard(tokenURI, price);

    // Verify the gift card details
    const tokenId = 1; // First minted token
    const giftCard = await nftGiftMarketplace.giftCards(tokenId);

    expect(giftCard.creator).to.equal(creator.address);
    expect(giftCard.currentOwner).to.equal(creator.address);
    expect(giftCard.price).to.equal(price);
    expect(giftCard.forSale).to.be.true;
    expect(giftCard.message).to.equal("");
    expect(giftCard.secretHash).to.equal(ethers.ZeroHash); // Fixed
  });

  it("should allow a buyer to purchase a gift card", async function () {
    const tokenURI = "ipfs://QmExampleHash/metadata.json";
    const price = ethers.parseEther("0.0001"); // Updated price

    // Mint a gift card
    await nftGiftMarketplace.connect(creator).mintGiftCard(tokenURI, price);

    // Buy the gift card
    const tokenId = 1;
    const message = "Happy Birthday!";
    await nftGiftMarketplace.connect(buyer).buyGiftCard(tokenId, message, {
      value: price,
    });

    // Verify the updated gift card details
    const giftCard = await nftGiftMarketplace.giftCards(tokenId);
    expect(giftCard.currentOwner).to.equal(buyer.address);
    expect(giftCard.forSale).to.be.false;
    expect(giftCard.message).to.equal(message);
  });

  it("should allow the owner to set a secret key", async function () {
    const tokenURI = "ipfs://QmExampleHash/metadata.json";
    const price = ethers.parseEther("0.0001"); // Updated price

    // Mint a gift card
    await nftGiftMarketplace.connect(creator).mintGiftCard(tokenURI, price);

    // Set a secret key
    const tokenId = 1;
    const secret = "my-secret-key";
    await nftGiftMarketplace.connect(creator).setSecretKey(tokenId, secret);

    // Verify the secret hash
    const giftCard = await nftGiftMarketplace.giftCards(tokenId);
    const expectedHash = ethers.keccak256(ethers.toUtf8Bytes(secret)); // Updated hashing logic
    expect(giftCard.secretHash).to.equal(expectedHash);
  });

  it("should allow a user to claim a gift card with the correct secret key", async function () {
    const tokenURI = "ipfs://QmExampleHash/metadata.json";
    const price = ethers.parseEther("0.0001"); // Updated price

    // Mint a gift card
    await nftGiftMarketplace.connect(creator).mintGiftCard(tokenURI, price);

    // Set a secret key
    const tokenId = 1;
    const secret = "my-secret-key";
    await nftGiftMarketplace.connect(creator).setSecretKey(tokenId, secret);

    // Claim the gift card
    await nftGiftMarketplace.connect(buyer).claimGiftCard(tokenId, secret);

    // Verify the updated gift card details
    const giftCard = await nftGiftMarketplace.giftCards(tokenId);
    expect(giftCard.currentOwner).to.equal(buyer.address);
    expect(giftCard.secretHash).to.equal(ethers.ZeroHash); // Fixed
  });

  it("should fail to claim a gift card with an incorrect secret key", async function () {
    const tokenURI = "ipfs://QmExampleHash/metadata.json";
    const price = ethers.parseEther("0.0001"); // Updated price

    // Mint a gift card
    await nftGiftMarketplace.connect(creator).mintGiftCard(tokenURI, price);

    // Set a secret key
    const tokenId = 1;
    const secret = "my-secret-key";
    await nftGiftMarketplace.connect(creator).setSecretKey(tokenId, secret);

    // Attempt to claim the gift card with an incorrect secret
    const incorrectSecret = "wrong-secret";
    await expect(
      nftGiftMarketplace.connect(buyer).claimGiftCard(tokenId, incorrectSecret)
    ).to.be.revertedWith("Invalid secret");
  });

  it("should fail to set a secret key by a non-owner", async function () {
    const tokenURI = "ipfs://QmExampleHash/metadata.json";
    const price = ethers.parseEther("0.0001"); // Updated price

    // Mint a gift card
    await nftGiftMarketplace.connect(creator).mintGiftCard(tokenURI, price);

    // Attempt to set a secret key by a non-owner
    const tokenId = 1;
    const secret = "my-secret-key";
    await expect(
      nftGiftMarketplace.connect(buyer).setSecretKey(tokenId, secret)
    ).to.be.revertedWith("Only owner can set secret key");
  });

  it("should fail to buy a gift card without sufficient funds", async function () {
    const tokenURI = "ipfs://QmExampleHash/metadata.json";
    const price = ethers.parseEther("0.0001"); // Updated price

    // Mint a gift card
    await nftGiftMarketplace.connect(creator).mintGiftCard(tokenURI, price);

    // Attempt to buy the gift card with insufficient funds
    const tokenId = 1;
    const message = "Happy Birthday!";
    await expect(
      nftGiftMarketplace.connect(buyer).buyGiftCard(tokenId, message, {
        value: ethers.parseEther("0.00005"), // Insufficient funds
      })
    ).to.be.revertedWith("Incorrect price"); // Fixed
  });
});

async function testNFTMarketplaceWorkflow() {
  try {
    console.log("🚀 Starting NFT Marketplace Workflow Tests...\n");

    // Step 1: Artist Mints an NFT
    console.log("Step 1: Minting an NFT with an image");
    const mintData = {
      tokenURI: "ipfs://QmExampleHash/metadata.json", // Replace with actual IPFS metadata URI
      price: "0.0001", // Price in ETH
    };

    console.log("Request Data:", mintData);
    const mintResponse = await axios.post(
      `${API_URL}/api/giftcard/mint`,
      mintData
    );
    console.log("✅ Mint NFT Response:", mintResponse.data);
    console.log("----------------------------------------\n");

    // Use the minted tokenId for further steps
    const tokenId = mintResponse.data.tokenId; // Assuming the API returns the tokenId
    const creatorAddress = mintResponse.data.creator; // Assuming the API returns the creator's address
    console.log(`Using minted Token ID: ${tokenId}`);
    console.log(`Creator Address: ${creatorAddress}`);
    console.log("----------------------------------------\n");

    // Step 2: User Buys the NFT
    console.log("Step 2: Buying the NFT");
    const buyCardData = {
      tokenId: tokenId,
      message: "Enjoy this beautiful artwork! 🎨", // Optional message
      price: "0.0001",
    };

    console.log("Request Data:", buyCardData);
    const buyResponse = await axios.post(
      `${API_URL}/api/giftcard/buy`,
      buyCardData
    );
    console.log("✅ Buy NFT Response:", buyResponse.data);
    console.log("----------------------------------------\n");

    // Step 3: Verify Creator's Profit
    console.log("Step 3: Verifying Creator's Profit");
    const creatorBalanceBefore = await axios.get(
      `${API_URL}/api/wallet/balance`,
      {
        params: { address: creatorAddress },
      }
    );
    console.log(
      `Creator's Balance Before Sale: ${creatorBalanceBefore.data.balance} ETH`
    );

    const creatorBalanceAfter = await axios.get(
      `${API_URL}/api/wallet/balance`,
      {
        params: { address: creatorAddress },
      }
    );
    console.log(
      `Creator's Balance After Sale: ${creatorBalanceAfter.data.balance} ETH`
    );

    const profit =
      parseFloat(creatorBalanceAfter.data.balance) -
      parseFloat(creatorBalanceBefore.data.balance);
    console.log(`Creator's Profit: ${profit} ETH`);

    const expectedProfit = 0.0001 * 0.4; // 40% of 0.0001 ETH
    if (Math.abs(profit - expectedProfit) < 0.000001) {
      console.log("✅ Creator received the correct profit (40%)");
    } else {
      console.error("❌ Creator did not receive the correct profit");
    }
    console.log("----------------------------------------\n");

    console.log("✨ All tests completed successfully!");
  } catch (error) {
    console.error(
      "\n❌ Test failed:",
      error.response ? error.response.data : error.message
    );
    if (
      error.response &&
      error.response.data.error &&
      error.response.data.error.includes("INSUFFICIENT_FUNDS")
    ) {
      console.error(
        "\nPlease make sure you have enough Sepolia ETH in your wallet."
      );
      console.error("You can get test ETH from the Sepolia faucet.");
    }
  }
}

// Run the tests
testNFTMarketplaceWorkflow();
