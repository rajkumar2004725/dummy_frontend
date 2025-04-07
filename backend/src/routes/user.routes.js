const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// Get user by wallet address
router.get('/:address', async (req, res) => {
  try {
    const user = await User.findOne({ where: { walletAddress: req.params.address } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      walletAddress: user.walletAddress,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profileImageUrl: user.profileImageUrl,
      totalGiftCardsCreated: user.totalGiftCardsCreated,
      totalGiftCardsSent: user.totalGiftCardsSent,
      totalGiftCardsReceived: user.totalGiftCardsReceived,
      totalBackgroundsMinted: user.totalBackgroundsMinted,
      lastLoginAt: user.lastLoginAt
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { username, email, bio, profileImageUrl } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.profileImageUrl = profileImageUrl || user.profileImageUrl;
    await user.save();

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profileImageUrl: user.profileImageUrl
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user activity
router.get('/activity', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['totalGiftCardsCreated', 'totalGiftCardsSent', 'totalGiftCardsReceived', 'totalBackgroundsMinted']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      totalGiftCardsCreated: user.totalGiftCardsCreated,
      totalGiftCardsSent: user.totalGiftCardsSent,
      totalGiftCardsReceived: user.totalGiftCardsReceived,
      totalBackgroundsMinted: user.totalBackgroundsMinted
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to get activity' });
  }
});

module.exports = router;
