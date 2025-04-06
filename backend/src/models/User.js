const { DataTypes } = require('sequelize');
const sequelize = require('../../db/db_config');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  walletAddress: {
    type: DataTypes.STRING,
    field: 'wallet_address',
    allowNull: false,
    unique: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  profileImageUrl: {
    type: DataTypes.TEXT,
    field: 'profile_image_url',
    allowNull: true
  },
  totalGiftCardsCreated: {
    type: DataTypes.INTEGER,
    field: 'total_gift_cards_created',
    defaultValue: 0
  },
  totalGiftCardsSent: {
    type: DataTypes.INTEGER,
    field: 'total_gift_cards_sent',
    defaultValue: 0
  },
  totalGiftCardsReceived: {
    type: DataTypes.INTEGER,
    field: 'total_gift_cards_received',
    defaultValue: 0
  },
  totalBackgroundsMinted: {
    type: DataTypes.INTEGER,
    field: 'total_backgrounds_minted',
    defaultValue: 0
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    field: 'last_login_at',
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at',
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = User;