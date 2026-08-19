const sequelize = require('../config/database');
const Genre = require('./Genre');
const Series = require('./Series');
const Studio = require('./Studio');
const Review = require('./Review');
const CustomRating = require('./CustomRating');
const User = require('./User');
const Game = require('./Game');
const Favorite = require('./Favorite');
const ReadMark = require('./ReadMark');
const Comment = require('./Comment');
const ReviewLike = require('./ReviewLike');

// ========================
// Game associations
// ========================

// Game belongs to User (creator)
Game.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
User.hasMany(Game, { foreignKey: 'createdById', as: 'createdGames' });

// Game belongs to Series (optional)
Game.belongsTo(Series, { foreignKey: 'seriesId', as: 'series' });
Series.hasMany(Game, { foreignKey: 'seriesId', as: 'games' });

// Game belongs to Studio (optional)
Game.belongsTo(Studio, { foreignKey: 'studioId', as: 'studio' });
Studio.hasMany(Game, { foreignKey: 'studioId', as: 'games' });

// Game has many Genres (many-to-many)
Game.belongsToMany(Genre, { through: 'game_genres', foreignKey: 'gameId', otherKey: 'genreId', as: 'genres' });
Genre.belongsToMany(Game, { through: 'game_genres', foreignKey: 'genreId', otherKey: 'gameId', as: 'games' });

// Game has many Reviews
Game.hasMany(Review, { foreignKey: 'gameId', as: 'reviews' });
Review.belongsTo(Game, { foreignKey: 'gameId', as: 'game' });

// ========================
// Review associations
// ========================

// Review belongs to User (author)
Review.belongsTo(User, { foreignKey: 'userId', as: 'author' });
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });

// Review has many CustomRatings
Review.hasMany(CustomRating, { foreignKey: 'reviewId', as: 'customRatings', onDelete: 'CASCADE' });
CustomRating.belongsTo(Review, { foreignKey: 'reviewId', as: 'review' });

// Review has many Comments
Review.hasMany(Comment, { foreignKey: 'reviewId', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Review, { foreignKey: 'reviewId', as: 'review' });

// Comment belongs to User
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });

// Review has many ReviewLikes
Review.hasMany(ReviewLike, { foreignKey: 'reviewId', as: 'likes', onDelete: 'CASCADE' });
ReviewLike.belongsTo(Review, { foreignKey: 'reviewId', as: 'review' });

// User has many ReviewLikes
User.hasMany(ReviewLike, { foreignKey: 'userId', as: 'reviewLikes', onDelete: 'CASCADE' });
ReviewLike.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ========================
// Legacy Review associations (kept for migration compatibility)
// These allow the migration script to read old FK data from reviews
// ========================
Review.belongsTo(Series, { foreignKey: 'seriesId', as: 'series' });
Series.hasMany(Review, { foreignKey: 'seriesId', as: 'reviews' });

Review.belongsTo(Studio, { foreignKey: 'studioId', as: 'studio' });
Studio.hasMany(Review, { foreignKey: 'studioId', as: 'reviews' });

Review.belongsToMany(Genre, { through: 'review_genres', foreignKey: 'reviewId', as: 'genres' });
Genre.belongsToMany(Review, { through: 'review_genres', foreignKey: 'genreId', as: 'reviews' });

// ========================
// Favorites (User <-> Game)
// ========================
User.belongsToMany(Game, { through: Favorite, foreignKey: 'userId', otherKey: 'gameId', as: 'favoriteGames' });
Game.belongsToMany(User, { through: Favorite, foreignKey: 'gameId', otherKey: 'userId', as: 'favoritedBy' });

// ========================
// Read marks (User <-> Review)
// ========================
User.belongsToMany(Review, { through: ReadMark, foreignKey: 'userId', otherKey: 'reviewId', as: 'readReviews' });
Review.belongsToMany(User, { through: ReadMark, foreignKey: 'reviewId', otherKey: 'userId', as: 'readBy' });

module.exports = {
  sequelize,
  Genre,
  Series,
  Studio,
  Review,
  CustomRating,
  User,
  Game,
  Favorite,
  ReadMark,
  Comment,
  ReviewLike
};
