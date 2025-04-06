const { DataTypes } = require('sequelize');
const sequelize = require('../../db/db_config');

const Background = sequelize.define('Background', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false
  },
  artistAddress: {
    type: DataTypes.STRING,
    field: 'artist_address',
    allowNull: false
  },
  imageURI: {
    type: DataTypes.TEXT,
    field: 'image_uri',
    allowNull: false
  },
  usageCount: {
    type: DataTypes.INTEGER,
    field: 'usage_count',
    defaultValue: 0
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at'
  }
}, {
  tableName: 'backgrounds',
  timestamps: true,
  underscored: true
});

module.exports = Background;