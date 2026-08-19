const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Game = sequelize.define('Game', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  gameTitle: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'game_title'
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  coverImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'cover_image'
  },
  releaseDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'release_date'
  },
  soundtrackUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'soundtrack_url'
  },
  platforms: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  }
}, {
  tableName: 'games',
  timestamps: true,
  underscored: true
});

module.exports = Game;
