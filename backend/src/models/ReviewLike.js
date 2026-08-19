const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReviewLike = sequelize.define('ReviewLike', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reviewId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'review_id',
    references: {
      model: 'reviews',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'review_likes',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['review_id', 'user_id']
    }
  ]
});

module.exports = ReviewLike;
