const express = require('express');
const router = express.Router();

// Import all route files
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const backgroundRoutes = require('./background.routes');
const giftCardRoutes = require('./giftCard.routes');
const imageRoutes = require('./image.routes');
const walletRoutes = require('./wallet.routes');

// Mount all routes
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/backgrounds', backgroundRoutes);
router.use('/api/gift-cards', giftCardRoutes);
router.use('/api/images', imageRoutes);
router.use('/api/wallet', walletRoutes);

module.exports = router;
