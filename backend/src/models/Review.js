const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // FK to Game (nullable during migration, then required)
  gameId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'game_id'
  },
  // FK to User (author) (nullable during migration, then required)
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  hardwareSpecs: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'hardware_specs'
  },
  storyRating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0, max: 10 },
    field: 'story_rating'
  },
  musicRating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0, max: 10 },
    field: 'music_rating'
  },
  graphicsRating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0, max: 10 },
    field: 'graphics_rating'
  },
  optimizationRating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0, max: 10 },
    field: 'optimization_rating'
  },
  gameplayRating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0, max: 10 },
    field: 'gameplay_rating'
  },
  averageRating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'average_rating'
  },
  isDraft: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_draft'
  },
  pros: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  cons: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  gameStatus: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'main_story',
    field: 'game_status'
  },
  playtimeHours: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    field: 'playtime_hours'
  },
  // ========== Legacy columns kept for migration ==========
  // These will remain in the DB but are no longer used by new code.
  // Game-level data is now on the Game model.
  gameTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'game_title'
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
  platforms: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  soundtrackUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'soundtrack_url'
  }
}, {
  tableName: 'reviews'
});

module.exports = Review;
