const axios = require("axios");

const API_URL = "http://localhost:3001";

async function testNFTMarketplaceWorkflow() {
  try {
    console.log("🚀 Starting NFT Marketplace Workflow Tests...\n");

    // Step 1: Artist Mints an NFT
    console.log("Step 1: Minting an NFT with an image");
    const mintData = {
      tokenURI: "ipfs://QmExampleHashPhotography/metadata.json", // Replace with actual IPFS metadata URI
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
    const tokenId = mintResponse.data.tokenId; // Extract tokenId from the response
    if (!tokenId) {
      throw new Error(
        "Token ID is undefined. Ensure the backend returns the tokenId."
      );
    }
    console.log(`Using minted Token ID: ${tokenId}`);
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

    // Step 3: Buyer Sets a Secret Key (Optional)
    console.log("Step 3: Setting a Secret Key for the NFT");
    const secretKey = "my-secret-key"; // Secret key for the recipient
    const setSecretData = {
      tokenId: tokenId,
      secret: secretKey,
    };

    console.log("Request Data:", setSecretData);
    const setSecretResponse = await axios.post(
      `${API_URL}/api/giftcard/set-secret`,
      setSecretData
    );
    console.log("✅ Set Secret Key Response:", setSecretResponse.data);
    console.log("----------------------------------------\n");

    // Step 4: Recipient Claims the NFT
    console.log("Step 4: Recipient Claims the NFT using the Secret Key");
    const claimCardData = {
      tokenId: tokenId,
      secret: secretKey,
    };

    console.log("Request Data:", claimCardData);
    const claimResponse = await axios.post(
      `${API_URL}/api/giftcard/claim`,
      claimCardData
    );
    console.log("✅ Claim NFT Response:", claimResponse.data);
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
