const express = require('express');
const router = express.Router();
const Background = require('../models/Background');
const { upload } = require('../middleware/multer');
const { verifyToken } = require('../middleware/auth');

// Get all backgrounds
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const where = category ? { category } : {};
    const backgrounds = await Background.findAll({ where });
    res.json(backgrounds);
  } catch (error) {
    console.error('Get backgrounds error:', error);
    res.status(500).json({ error: 'Failed to get backgrounds' });
  }
});

// Get background by ID
router.get('/:id', async (req, res) => {
  try {
    const background = await Background.findByPk(req.params.id);
    if (!background) {
      return res.status(404).json({ error: 'Background not found' });
    }
    res.json(background);
  } catch (error) {
    console.error('Get background error:', error);
    res.status(500).json({ error: 'Failed to get background' });
  }
});

// Create new background
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { category } = req.body;
    const imageURI = req.file ? req.file.location : null;

    // Check if imageURI already exists
    const existing = await Background.findOne({ where: { imageURI } });
    if (existing) {
      return res.status(400).json({ error: 'This background has already been minted' });
    }

    const background = await Background.create({
      artistAddress: req.user.walletAddress,
      imageURI,
      category,
      usageCount: 0
    });

    res.status(201).json({
      id: background.id,
      artistAddress: background.artistAddress,
      imageURI: background.imageURI,
      category: background.category,
      usageCount: background.usageCount
    });
  } catch (error) {
    console.error('Create background error:', error);
    res.status(500).json({ error: 'Failed to create background' });
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Background.findAll({
      attributes: ['category'],
      group: ['category']
    });
    res.json(categories.map(cat => cat.category));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

module.exports = router;
