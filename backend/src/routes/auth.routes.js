const express = require('express');
const router = express.Router();
const { verifySignature } = require('../utils/crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// Login with wallet
router.post('/login', async (req, res) => {
  try {
    const { address, signature } = req.body;
    
    // Verify signature
    const isValid = verifySignature(address, signature);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Get or create user
    let user = await User.findOne({ where: { walletAddress: address } });
    if (!user) {
      user = await User.create({ walletAddress: address });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        profileImageUrl: user.profileImageUrl
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      walletAddress: user.walletAddress,
      username: user.username,
      profileImageUrl: user.profileImageUrl,
      totalGiftCardsCreated: user.totalGiftCardsCreated,
      totalGiftCardsSent: user.totalGiftCardsSent,
      totalGiftCardsReceived: user.totalGiftCardsReceived,
      totalBackgroundsMinted: user.totalBackgroundsMinted
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;
