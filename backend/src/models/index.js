const sequelize = require('../config/database');
const Genre = require('./Genre');
const Series = require('./Series');
const Studio = require('./Studio');
const Review = require('./Review');
const CustomRating = require('./CustomRating');
const User = require('./User');

// Review belongs to Series (optional)
Review.belongsTo(Series, { foreignKey: 'seriesId', as: 'series' });
Series.hasMany(Review, { foreignKey: 'seriesId', as: 'reviews' });

// Review belongs to Studio (optional)
Review.belongsTo(Studio, { foreignKey: 'studioId', as: 'studio' });
Studio.hasMany(Review, { foreignKey: 'studioId', as: 'reviews' });

// Review has many Genres (many-to-many)
Review.belongsToMany(Genre, { through: 'review_genres', foreignKey: 'reviewId', as: 'genres' });
Genre.belongsToMany(Review, { through: 'review_genres', foreignKey: 'genreId', as: 'reviews' });

// Review has many CustomRatings
Review.hasMany(CustomRating, { foreignKey: 'reviewId', as: 'customRatings', onDelete: 'CASCADE' });
CustomRating.belongsTo(Review, { foreignKey: 'reviewId', as: 'review' });

module.exports = {
  sequelize,
  Genre,
  Series,
  Studio,
  Review,
  CustomRating,
  User
};
