const { Review, Genre, Series, Studio, CustomRating, sequelize } = require('../models');
const { Op } = require('sequelize');
const { cleanupOrphanedUploads } = require('../utils/cleanupUploads');

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

    const whereClause = {};
    if (!req.user) {
      whereClause.isDraft = false;
    }

    const { count, rows } = await Review.findAndCountAll({
      where: whereClause,
      include: [
        { model: Genre, as: 'genres', attributes: ['id', 'name', 'slug'] },
        { model: Series, as: 'series', attributes: ['id', 'name', 'slug'] },
        { model: Studio, as: 'studio', attributes: ['id', 'name', 'slug'] },
        { model: CustomRating, as: 'customRatings' }
      ],
      distinct: true,
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

    if (!review || (review.isDraft && !req.user)) {
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
      releaseDate,
      isDraft,
      pros,
      cons,
      gameStatus,
      playtimeHours,
      platforms,
      soundtrackUrl
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
      releaseDate: releaseDate || null,
      isDraft: isDraft || false,
      pros: Array.isArray(pros) ? pros : [],
      cons: Array.isArray(cons) ? cons : [],
      gameStatus: gameStatus || 'main_story',
      playtimeHours: typeof playtimeHours === 'number' ? playtimeHours : (parseFloat(playtimeHours) || 0),
      platforms: Array.isArray(platforms) ? platforms : [],
      soundtrackUrl: soundtrackUrl || null
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
      releaseDate,
      isDraft,
      pros,
      cons,
      gameStatus,
      playtimeHours,
      platforms,
      soundtrackUrl
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
      releaseDate: releaseDate !== undefined ? (releaseDate || null) : review.releaseDate,
      isDraft: isDraft !== undefined ? isDraft : review.isDraft,
      pros: pros !== undefined ? (Array.isArray(pros) ? pros : []) : review.pros,
      cons: cons !== undefined ? (Array.isArray(cons) ? cons : []) : review.cons,
      gameStatus: gameStatus !== undefined ? gameStatus : review.gameStatus,
      playtimeHours: playtimeHours !== undefined ? (typeof playtimeHours === 'number' ? playtimeHours : (parseFloat(playtimeHours) || 0)) : review.playtimeHours,
      platforms: platforms !== undefined ? (Array.isArray(platforms) ? platforms : []) : review.platforms,
      soundtrackUrl: soundtrackUrl !== undefined ? (soundtrackUrl || null) : review.soundtrackUrl
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

    // Trigger cleanup of orphaned files in background
    cleanupOrphanedUploads(0).catch(err => console.error('Background cleanup error:', err));

    res.json({ message: 'Recenzja usunięta pomyślnie' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Helper for folding Polish diacritics
const foldDiacritics = (str) => {
  if (!str) return '';
  return str
    .replace(/[ąĄ]/g, 'a')
    .replace(/[ćĆ]/g, 'c')
    .replace(/[ęĘ]/g, 'e')
    .replace(/[łŁ]/g, 'l')
    .replace(/[ńŃ]/g, 'n')
    .replace(/[óÓ]/g, 'o')
    .replace(/[śŚ]/g, 's')
    .replace(/[źŹżŻ]/g, 'z');
};

// Normalize string: lowercase, remove punctuation & diacritics
const normalizeForSearch = (str) => {
  if (!str) return '';
  return foldDiacritics(str.toLowerCase())
    .replace(/[^a-z0-9]/g, '');
};

// Extract search tokens (words)
const getTokens = (str) => {
  if (!str) return [];
  return foldDiacritics(str.toLowerCase())
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 0);
};

// Search reviews with fuzzy & normalized matching
const searchReviews = async (req, res) => {
  try {
    const rawQuery = (req.query.q || '').trim();
    if (!rawQuery) {
      return res.json({
        reviews: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const normalizedQuery = normalizeForSearch(rawQuery);
    const tokens = getTokens(rawQuery);
    const safeRawQuery = rawQuery.replace(/'/g, "''");
    const safeNormQuery = normalizedQuery.replace(/'/g, "''");

    // SQL expression for normalized field (removes punctuation + converts Polish letters to ASCII)
    const normalizedExpr = (colName) => 
      sequelize.fn(
        'translate',
        sequelize.fn('regexp_replace', sequelize.fn('lower', sequelize.col(colName)), '[^a-ząćęłńóśźż0-9]', '', 'g'),
        'ąćęłńóśźż',
        'acelnoszz'
      );

    const orConditions = [
      // 1. Standard ILIKE matching
      { title: { [Op.iLike]: `%${rawQuery}%` } },
      { gameTitle: { [Op.iLike]: `%${rawQuery}%` } },
      { content: { [Op.iLike]: `%${rawQuery}%` } }
    ];

    // 2. Normalized matching (e.g. "whos lila" matches "Who's Lila?", "spiderman" matches "Spider-Man")
    if (normalizedQuery.length >= 2) {
      orConditions.push(
        sequelize.where(normalizedExpr('Review.game_title'), { [Op.like]: `%${safeNormQuery}%` })
      );
      orConditions.push(
        sequelize.where(normalizedExpr('Review.title'), { [Op.like]: `%${safeNormQuery}%` })
      );
    }

    // 3. Multi-word token matching (all words must appear in normalized title)
    if (tokens.length > 1) {
      const allTokensInGameTitle = {
        [Op.and]: tokens.map(t => 
          sequelize.where(normalizedExpr('Review.game_title'), { [Op.like]: `%${t}%` })
        )
      };
      const allTokensInTitle = {
        [Op.and]: tokens.map(t => 
          sequelize.where(normalizedExpr('Review.title'), { [Op.like]: `%${t}%` })
        )
      };
      orConditions.push(allTokensInGameTitle);
      orConditions.push(allTokensInTitle);
    }

    // 4. Trigram similarity matching for typos (e.g. "Who's Lilla" or "Slient Hill")
    if (rawQuery.length >= 3) {
      try {
        orConditions.push(
          sequelize.where(
            sequelize.fn('similarity', sequelize.col('Review.game_title'), rawQuery),
            { [Op.gt]: 0.25 }
          )
        );
        orConditions.push(
          sequelize.where(
            sequelize.fn('similarity', sequelize.col('Review.title'), rawQuery),
            { [Op.gt]: 0.25 }
          )
        );
      } catch (e) {
        // Similarity function may not be available on some DB configs
      }
    }

    const whereClause = {
      [Op.or]: orConditions
    };

    if (!req.user) {
      whereClause.isDraft = false;
    }

    // Relevance ordering: exact/normalized gameTitle matches top, then title, then others
    const relevanceOrder = [
      [
        sequelize.literal(`
          CASE 
            WHEN lower("Review"."game_title") = lower('${safeRawQuery}') THEN 1
            WHEN translate(regexp_replace(lower("Review"."game_title"), '[^a-ząćęłńóśźż0-9]', '', 'g'), 'ąćęłńóśźż', 'acelnoszz') = '${safeNormQuery}' THEN 2
            WHEN translate(regexp_replace(lower("Review"."game_title"), '[^a-ząćęłńóśźż0-9]', '', 'g'), 'ąćęłńóśźż', 'acelnoszz') LIKE '%${safeNormQuery}%' THEN 3
            WHEN "Review"."game_title" ILIKE '%${safeRawQuery}%' THEN 4
            WHEN "Review"."title" ILIKE '%${safeRawQuery}%' THEN 5
            ELSE 6
          END
        `),
        'ASC'
      ],
      ['updatedAt', 'DESC']
    ];

    let result;
    try {
      result = await Review.findAndCountAll({
        where: whereClause,
        include: [
          { model: Genre, as: 'genres', attributes: ['id', 'name', 'slug'] },
          { model: Series, as: 'series', attributes: ['id', 'name', 'slug'] },
          { model: Studio, as: 'studio', attributes: ['id', 'name', 'slug'] },
          { model: CustomRating, as: 'customRatings' }
        ],
        distinct: true,
        order: relevanceOrder,
        limit,
        offset
      });
    } catch (dbError) {
      // Fallback query if similarity or complex literal fails on older DB setups
      console.warn('Fuzzy query fallback invoked:', dbError.message);
      const fallbackWhere = {
        [Op.or]: [
          { title: { [Op.iLike]: `%${rawQuery}%` } },
          { gameTitle: { [Op.iLike]: `%${rawQuery}%` } },
          { content: { [Op.iLike]: `%${rawQuery}%` } },
          sequelize.where(normalizedExpr('Review.game_title'), { [Op.like]: `%${safeNormQuery}%` })
        ]
      };
      if (!req.user) {
        fallbackWhere.isDraft = false;
      }
      result = await Review.findAndCountAll({
        where: fallbackWhere,
        include: [
          { model: Genre, as: 'genres', attributes: ['id', 'name', 'slug'] },
          { model: Series, as: 'series', attributes: ['id', 'name', 'slug'] },
          { model: Studio, as: 'studio', attributes: ['id', 'name', 'slug'] },
          { model: CustomRating, as: 'customRatings' }
        ],
        distinct: true,
        order: [['updatedAt', 'DESC']],
        limit,
        offset
      });
    }

    res.json({
      reviews: result.rows,
      pagination: {
        total: result.count,
        page,
        limit,
        totalPages: Math.ceil(result.count / limit)
      }
    });
  } catch (error) {
    console.error('Search reviews error:', error);
    res.status(500).json({ error: 'Błąd serwera podczas wyszukiwania' });
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
