const { Review, Genre, Series, Studio, CustomRating, sequelize } = require('../models');
const { Op } = require('sequelize');

const slugify = (text) => {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Calculate average rating including custom ratings
const calculateAverageRating = (review, customRatings = []) => {
  const baseRatings = [
    review.storyRating,
    review.musicRating,
    review.graphicsRating,
    review.optimizationRating,
    review.gameplayRating
  ];
  
  const customValues = customRatings.map(cr => cr.value);
  const allRatings = [...baseRatings, ...customValues];
  
  return allRatings.reduce((sum, val) => sum + val, 0) / allRatings.length;
};

// Get all reviews with pagination
const getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const sort = req.query.sort || 'newest';

    // Determine sort order
    let order;
    switch (sort) {
      case 'releaseDate':
        order = [['releaseDate', 'DESC NULLS LAST']];
        break;
      case 'ratingHigh':
        order = [['averageRating', 'DESC']];
        break;
      case 'ratingLow':
        order = [['averageRating', 'ASC']];
        break;
      case 'newest':
      default:
        order = [['updatedAt', 'DESC']];
        break;
    }

    const { count, rows } = await Review.findAndCountAll({
      include: [
        { model: Genre, as: 'genres', attributes: ['id', 'name', 'slug'] },
        { model: Series, as: 'series', attributes: ['id', 'name', 'slug'] },
        { model: Studio, as: 'studio', attributes: ['id', 'name', 'slug'] },
        { model: CustomRating, as: 'customRatings' }
      ],
      order,
      limit,
      offset
    });

    res.json({
      reviews: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Get single review by ID
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, {
      include: [
        { model: Genre, as: 'genres', attributes: ['id', 'name', 'slug'] },
        { model: Series, as: 'series', attributes: ['id', 'name', 'slug'] },
        { model: Studio, as: 'studio', attributes: ['id', 'name', 'slug'] },
        { model: CustomRating, as: 'customRatings' }
      ]
    });

    if (!review) {
      return res.status(404).json({ error: 'Recenzja nie znaleziona' });
    }

    res.json(review);
  } catch (error) {
    console.error('Get review by ID error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Create new review
const createReview = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      title,
      gameTitle,
      content,
      hardwareSpecs,
      storyRating,
      musicRating,
      graphicsRating,
      optimizationRating,
      gameplayRating,
      genreIds,
      seriesId,
      studioId,
      customRatings,
      coverImage,
      releaseDate
    } = req.body;

    // Calculate average
    const averageRating = calculateAverageRating(
      { storyRating, musicRating, graphicsRating, optimizationRating, gameplayRating },
      customRatings || []
    );

    const review = await Review.create({
      title,
      gameTitle,
      content,
      hardwareSpecs,
      storyRating,
      musicRating,
      graphicsRating,
      optimizationRating,
      gameplayRating,
      averageRating,
      seriesId: seriesId || null,
      studioId: studioId || null,
      coverImage,
      releaseDate: releaseDate || null
    }, { transaction });

    // Add genres
    if (genreIds && genreIds.length > 0) {
      await review.setGenres(genreIds, { transaction });
    }

    // Add custom ratings
    if (customRatings && customRatings.length > 0) {
      await CustomRating.bulkCreate(
        customRatings.map(cr => ({
          reviewId: review.id,
          scaleName: cr.scaleName,
          value: cr.value
        })),
        { transaction }
      );
    }

    await transaction.commit();

    // Fetch complete review with associations
    const completeReview = await Review.findByPk(review.id, {
      include: [
        { model: Genre, as: 'genres' },
        { model: Series, as: 'series' },
        { model: Studio, as: 'studio' },
        { model: CustomRating, as: 'customRatings' }
      ]
    });

    res.status(201).json(completeReview);
  } catch (error) {
    await transaction.rollback();
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Update review
const updateReview = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Recenzja nie znaleziona' });
    }

    const {
      title,
      gameTitle,
      content,
      hardwareSpecs,
      storyRating,
      musicRating,
      graphicsRating,
      optimizationRating,
      gameplayRating,
      genreIds,
      seriesId,
      studioId,
      customRatings,
      coverImage,
      releaseDate
    } = req.body;

    // Calculate new average
    const averageRating = calculateAverageRating(
      { 
        storyRating: storyRating ?? review.storyRating,
        musicRating: musicRating ?? review.musicRating,
        graphicsRating: graphicsRating ?? review.graphicsRating,
        optimizationRating: optimizationRating ?? review.optimizationRating,
        gameplayRating: gameplayRating ?? review.gameplayRating
      },
      customRatings || []
    );

    await review.update({
      title: title ?? review.title,
      gameTitle: gameTitle ?? review.gameTitle,
      content: content ?? review.content,
      hardwareSpecs: hardwareSpecs ?? review.hardwareSpecs,
      storyRating: storyRating ?? review.storyRating,
      musicRating: musicRating ?? review.musicRating,
      graphicsRating: graphicsRating ?? review.graphicsRating,
      optimizationRating: optimizationRating ?? review.optimizationRating,
      gameplayRating: gameplayRating ?? review.gameplayRating,
      averageRating,
      seriesId: seriesId !== undefined ? seriesId : review.seriesId,
      studioId: studioId !== undefined ? studioId : review.studioId,
      coverImage: coverImage ?? review.coverImage,
      releaseDate: releaseDate !== undefined ? (releaseDate || null) : review.releaseDate
    }, { transaction });

    // Update genres
    if (genreIds !== undefined) {
      await review.setGenres(genreIds, { transaction });
    }

    // Update custom ratings
    if (customRatings !== undefined) {
      await CustomRating.destroy({ where: { reviewId: review.id }, transaction });
      if (customRatings.length > 0) {
        await CustomRating.bulkCreate(
          customRatings.map(cr => ({
            reviewId: review.id,
            scaleName: cr.scaleName,
            value: cr.value
          })),
          { transaction }
        );
      }
    }

    await transaction.commit();

    // Fetch updated review
    const updatedReview = await Review.findByPk(review.id, {
      include: [
        { model: Genre, as: 'genres' },
        { model: Series, as: 'series' },
        { model: Studio, as: 'studio' },
        { model: CustomRating, as: 'customRatings' }
      ]
    });

    res.json(updatedReview);
  } catch (error) {
    await transaction.rollback();
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Delete review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Recenzja nie znaleziona' });
    }

    await review.destroy();
    res.json({ message: 'Recenzja usunięta pomyślnie' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Search reviews
const searchReviews = async (req, res) => {
  try {
    const query = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Review.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { gameTitle: { [Op.iLike]: `%${query}%` } },
          { content: { [Op.iLike]: `%${query}%` } }
        ]
      },
      include: [
        { model: Genre, as: 'genres', attributes: ['id', 'name', 'slug'] },
        { model: Series, as: 'series', attributes: ['id', 'name', 'slug'] },
        { model: Studio, as: 'studio', attributes: ['id', 'name', 'slug'] },
        { model: CustomRating, as: 'customRatings' }
      ],
      order: [['updatedAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      reviews: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Search reviews error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

module.exports = {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  searchReviews
};
