const express = require('express');
const router = express.Router();
const GiftCard = require('../models/GiftCard');
const Background = require('../models/Background');
const { verifyToken } = require('../middleware/auth');
const { hashSecret, verifySecret } = require('../utils/crypto');

// Create new gift card
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { backgroundId, price, message } = req.body;
    
    // Check if background exists
    const background = await Background.findByPk(backgroundId);
    if (!background) {
      return res.status(404).json({ error: 'Background not found' });
    }

    // Create gift card
    const giftCard = await GiftCard.create({
      creator: req.user.walletAddress,
      currentOwner: req.user.walletAddress,
      price,
      message,
      backgroundId,
      isClaimable: false
    });

    // Increment background usage count
    await Background.increment('usageCount', {
      where: { id: backgroundId }
    });

    res.status(201).json({
      id: giftCard.id,
      creator: giftCard.creator,
      currentOwner: giftCard.currentOwner,
      price: giftCard.price,
      message: giftCard.message,
      backgroundId: giftCard.backgroundId,
      isClaimable: giftCard.isClaimable
    });
  } catch (error) {
    console.error('Create gift card error:', error);
    res.status(500).json({ error: 'Failed to create gift card' });
  }
});

// Get gift card by ID
router.get('/:id', async (req, res) => {
  try {
    const giftCard = await GiftCard.findByPk(req.params.id, {
      include: [{ model: Background, as: 'background' }]
    });
    if (!giftCard) {
      return res.status(404).json({ error: 'Gift card not found' });
    }
    res.json(giftCard);
  } catch (error) {
    console.error('Get gift card error:', error);
    res.status(500).json({ error: 'Failed to get gift card' });
  }
});

// Transfer gift card
router.post('/:id/transfer', verifyToken, async (req, res) => {
  try {
    const { recipientAddress } = req.body;
    const giftCard = await GiftCard.findByPk(req.params.id);

    if (!giftCard) {
      return res.status(404).json({ error: 'Gift card not found' });
    }

    if (giftCard.currentOwner !== req.user.walletAddress) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    giftCard.currentOwner = recipientAddress;
    giftCard.isClaimable = false;
    await giftCard.save();

    res.json({
      id: giftCard.id,
      currentOwner: giftCard.currentOwner,
      isClaimable: giftCard.isClaimable
    });
  } catch (error) {
    console.error('Transfer gift card error:', error);
    res.status(500).json({ error: 'Failed to transfer gift card' });
  }
});

// Set secret key for claimable gift card
router.post('/:id/set-secret', verifyToken, async (req, res) => {
  try {
    const { secret } = req.body;
    const giftCard = await GiftCard.findByPk(req.params.id);

    if (!giftCard) {
      return res.status(404).json({ error: 'Gift card not found' });
    }

    if (giftCard.currentOwner !== req.user.walletAddress) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const secretHash = hashSecret(secret);
    giftCard.secretHash = secretHash;
    giftCard.isClaimable = true;
    await giftCard.save();

    res.json({
      id: giftCard.id,
      isClaimable: giftCard.isClaimable
    });
  } catch (error) {
    console.error('Set secret error:', error);
    res.status(500).json({ error: 'Failed to set secret' });
  }
});

// Claim gift card
router.post('/:id/claim', async (req, res) => {
  try {
    const { secret } = req.body;
    const giftCard = await GiftCard.findByPk(req.params.id);

    if (!giftCard) {
      return res.status(404).json({ error: 'Gift card not found' });
    }

    if (!giftCard.isClaimable) {
      return res.status(400).json({ error: 'Gift card is not claimable' });
    }

    if (!verifySecret(secret, giftCard.secretHash)) {
      return res.status(400).json({ error: 'Invalid secret' });
    }

    giftCard.currentOwner = req.user.walletAddress;
    giftCard.secretHash = null;
    giftCard.isClaimable = false;
    await giftCard.save();

    res.json({
      id: giftCard.id,
      currentOwner: giftCard.currentOwner,
      isClaimable: giftCard.isClaimable
    });
  } catch (error) {
    console.error('Claim gift card error:', error);
    res.status(500).json({ error: 'Failed to claim gift card' });
  }
});

// Buy gift card
router.post('/:id/buy', verifyToken, async (req, res) => {
  try {
    const { message } = req.body;
    const giftCard = await GiftCard.findByPk(req.params.id);

    if (!giftCard) {
      return res.status(404).json({ error: 'Gift card not found' });
    }

    // TODO: Implement payment processing
    // For now, just update ownership
    giftCard.currentOwner = req.user.walletAddress;
    giftCard.message = message;
    await giftCard.save();

    res.json({
      id: giftCard.id,
      currentOwner: giftCard.currentOwner,
      message: giftCard.message
    });
  } catch (error) {
    console.error('Buy gift card error:', error);
    res.status(500).json({ error: 'Failed to buy gift card' });
  }
});

// Search gift cards
router.get('/search', async (req, res) => {
  try {
    const { priceRange, category, sortBy } = req.query;
    const where = {};

    if (priceRange) {
      const [min, max] = priceRange.split(',').map(Number);
      where.price = { [Op.between]: [min, max] };
    }

    if (category) {
      where.background = {
        category
      };
    }

    const order = sortBy === 'price' ? [['price', 'ASC']] : [['createdAt', 'DESC']];

    const giftCards = await GiftCard.findAll({
      where,
      include: [{ model: Background, as: 'background' }],
      order
    });

    res.json(giftCards);
  } catch (error) {
    console.error('Search gift cards error:', error);
    res.status(500).json({ error: 'Failed to search gift cards' });
  }
});

module.exports = router;
