const { expect } = require("chai");
const { ethers } = require("hardhat");
const axios = require("axios");

const API_URL = "http://localhost:3001";

describe("NFTGiftMarketplace", function () {
  let NFTGiftMarketplace, nftGiftMarketplace, owner, artist, creator, buyer;

  beforeEach(async function () {
    NFTGiftMarketplace = await ethers.getContractFactory("NFTGiftMarketplace");
    [owner, artist, creator, buyer] = await ethers.getSigners();
    nftGiftMarketplace = await NFTGiftMarketplace.deploy();
    await nftGiftMarketplace.deployed();
  });

  it("should mint a background with a category", async function () {
    const imageURI = "https://example.com/background1.png";
    const category = "Nature";

    // Mint a background
    await nftGiftMarketplace.connect(artist).mintBackground(imageURI, category);

    // Verify the background details
    const backgroundId = 1; // First minted background
    const background = await nftGiftMarketplace.backgrounds(backgroundId);

    expect(background.artist).to.equal(artist.address);
    expect(background.imageURI).to.equal(imageURI);
    expect(background.category).to.equal(category);
    expect(background.usageCount).to.equal(0);
  });

  it("should create a gift card using a background", async function () {
    const imageURI = "https://example.com/background1.png";
    const category = "Nature";
    const price = ethers.parseEther("0.01");
    const message = "Happy Birthday!";

    // Mint a background
    await nftGiftMarketplace.connect(artist).mintBackground(imageURI, category);

    // Create a gift card
    const backgroundId = 1;
    await nftGiftMarketplace
      .connect(creator)
      .createGiftCard(backgroundId, price, message);

    // Verify the gift card details
    const giftCardId = 1; // First minted gift card
    const giftCard = await nftGiftMarketplace.giftCards(giftCardId);

    expect(giftCard.creator).to.equal(creator.address);
    expect(giftCard.currentOwner).to.equal(creator.address);
    expect(giftCard.price).to.equal(price);
    expect(giftCard.message).to.equal(message);
    expect(giftCard.backgroundId).to.equal(backgroundId);
    expect(giftCard.isClaimable).to.be.false;

    // Verify the background usage count
    const background = await nftGiftMarketplace.backgrounds(backgroundId);
    expect(background.usageCount).to.equal(1);
  });

  it("should allow a buyer to purchase a gift card", async function () {
    const imageURI = "https://example.com/background1.png";
    const category = "Nature";
    const price = ethers.parseEther("0.01");
    const message = "Enjoy your gift!";

    // Mint a background
    await nftGiftMarketplace.connect(artist).mintBackground(imageURI, category);

    // Create a gift card
    const backgroundId = 1;
    await nftGiftMarketplace
      .connect(creator)
      .createGiftCard(backgroundId, price, "");

    // Buy the gift card
    const giftCardId = 1;
    await nftGiftMarketplace.connect(buyer).buyGiftCard(giftCardId, message, {
      value: price,
    });

    // Verify the updated gift card details
    const giftCard = await nftGiftMarketplace.giftCards(giftCardId);
    expect(giftCard.currentOwner).to.equal(buyer.address);
    expect(giftCard.message).to.equal(message);
  });

  it("should allow the owner to set a secret key", async function () {
    const imageURI = "https://example.com/background1.png";
    const category = "Nature";
    const price = ethers.parseEther("0.01");

    // Mint a background
    await nftGiftMarketplace.connect(artist).mintBackground(imageURI, category);

    // Create a gift card
    const backgroundId = 1;
    await nftGiftMarketplace
      .connect(creator)
      .createGiftCard(backgroundId, price, "");

    // Set a secret key
    const giftCardId = 1;
    const secret = "my-secret-key";
    await nftGiftMarketplace.connect(creator).setSecretKey(giftCardId, secret);

    // Verify the secret hash
    const giftCard = await nftGiftMarketplace.giftCards(giftCardId);
    const expectedHash = ethers.keccak256(ethers.toUtf8Bytes(secret));
    expect(giftCard.secretHash).to.equal(expectedHash);
    expect(giftCard.isClaimable).to.be.true;
  });

  it("should allow a user to claim a gift card with the correct secret key", async function () {
    const imageURI = "https://example.com/background1.png";
    const category = "Nature";
    const price = ethers.parseEther("0.01");

    // Mint a background
    await nftGiftMarketplace.connect(artist).mintBackground(imageURI, category);

    // Create a gift card
    const backgroundId = 1;
    await nftGiftMarketplace
      .connect(creator)
      .createGiftCard(backgroundId, price, "");

    // Set a secret key
    const giftCardId = 1;
    const secret = "my-secret-key";
    await nftGiftMarketplace.connect(creator).setSecretKey(giftCardId, secret);

    // Claim the gift card
    await nftGiftMarketplace.connect(buyer).claimGiftCard(giftCardId, secret);

    // Verify the updated gift card details
    const giftCard = await nftGiftMarketplace.giftCards(giftCardId);
    expect(giftCard.currentOwner).to.equal(buyer.address);
    expect(giftCard.secretHash).to.equal(ethers.ZeroHash);
    expect(giftCard.isClaimable).to.be.false;
  });

  it("should fail to claim a gift card with an incorrect secret key", async function () {
    const imageURI = "https://example.com/background1.png";
    const category = "Nature";
    const price = ethers.parseEther("0.01");

    // Mint a background
    await nftGiftMarketplace.connect(artist).mintBackground(imageURI, category);

    // Create a gift card
    const backgroundId = 1;
    await nftGiftMarketplace
      .connect(creator)
      .createGiftCard(backgroundId, price, "");

    // Set a secret key
    const giftCardId = 1;
    const secret = "my-secret-key";
    await nftGiftMarketplace.connect(creator).setSecretKey(giftCardId, secret);

    // Attempt to claim the gift card with an incorrect secret
    const incorrectSecret = "wrong-secret";
    await expect(
      nftGiftMarketplace
        .connect(buyer)
        .claimGiftCard(giftCardId, incorrectSecret)
    ).to.be.revertedWith("Invalid secret");
  });

  it("should fail to set a secret key by a non-owner", async function () {
    const imageURI = "https://example.com/background1.png";
    const category = "Nature";
    const price = ethers.parseEther("0.01");

    // Mint a background
    await nftGiftMarketplace.connect(artist).mintBackground(imageURI, category);

    // Create a gift card
    const backgroundId = 1;
    await nftGiftMarketplace
      .connect(creator)
      .createGiftCard(backgroundId, price, "");

    // Attempt to set a secret key by a non-owner
    const giftCardId = 1;
    const secret = "my-secret-key";
    await expect(
      nftGiftMarketplace.connect(buyer).setSecretKey(giftCardId, secret)
    ).to.be.revertedWith("Only the owner can set the secret key");
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
