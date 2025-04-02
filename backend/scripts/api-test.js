const request = require("supertest");
const axios = require("axios");
const express = require("express");
const app = require("../server"); // Adjust path if needed

const API_URL = "http://localhost:3001";

describe("NFTGiftMarketplace API Endpoints", () => {
  it("should return API running status", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("should fail minting gift card with missing fields", async () => {
    const res = await request(app).post("/api/giftcard/mint").send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should successfully mint, buy, set secret, and claim NFT", async () => {
    try {
      console.log("\n🚀 Starting NFT Marketplace Workflow Tests...\n");

      // Step 1: Artist Mints an NFT
      console.log("Step 1: Minting an NFT with an image");
      const mintData = {
        tokenURI: "ipfs://QmExampleHashPhotography/metadata.json", // Replace with actual IPFS metadata URI
        price: "0.0001", // Price in ETH
      };

      const mintResponse = await axios.post(
        `${API_URL}/api/giftcard/mint`,
        mintData
      );
      expect(mintResponse.status).toBe(200);
      expect(mintResponse.data.success).toBe(true);
      expect(mintResponse.data.tokenId).toBeDefined();

      const tokenId = mintResponse.data.tokenId;
      console.log(`Minted Token ID: ${tokenId}\n`);

      // Step 2: User Buys the NFT
      console.log("Step 2: Buying the NFT");
      const buyCardData = {
        tokenId: tokenId,
        message: "Enjoy this artwork! 🎨", // Optional message
        price: "0.0001",
      };

      const buyResponse = await axios.post(
        `${API_URL}/api/giftcard/buy`,
        buyCardData
      );
      expect(buyResponse.status).toBe(200);
      expect(buyResponse.data.success).toBe(true);

      // Step 3: Buyer Sets a Secret Key (Optional)
      console.log("Step 3: Setting a Secret Key for the NFT");
      const secretKey = "my-secret-key";
      const setSecretData = {
        tokenId: tokenId,
        secret: secretKey,
      };

      const setSecretResponse = await axios.post(
        `${API_URL}/api/giftcard/set-secret`,
        setSecretData
      );
      expect(setSecretResponse.status).toBe(200);
      expect(setSecretResponse.data.success).toBe(true);

      // Step 4: Recipient Claims the NFT
      console.log("Step 4: Recipient Claims the NFT using the Secret Key");
      const claimCardData = {
        tokenId: tokenId,
        secret: secretKey,
      };

      const claimResponse = await axios.post(
        `${API_URL}/api/giftcard/claim`,
        claimCardData
      );
      expect(claimResponse.status).toBe(200);
      expect(claimResponse.data.success).toBe(true);

      console.log("✨ All tests completed successfully!");
    } catch (error) {
      console.error(
        "\n❌ Test failed:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  });

  it("should fail setting secret key with missing fields", async () => {
    const res = await request(app).post("/api/giftcard/set-secret").send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should fail claiming gift card with missing fields", async () => {
    const res = await request(app).post("/api/giftcard/claim").send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
