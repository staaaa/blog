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

// Levenshtein distance between two strings
const levenshtein = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

// Check if query word fuzzy matches target word
const wordFuzzyMatch = (qWord, tWord) => {
  if (qWord === tWord) return { match: true, score: 1.0 };
  if (tWord.includes(qWord)) return { match: true, score: qWord.length / tWord.length };
  if (qWord.includes(tWord) && tWord.length >= 2) return { match: true, score: tWord.length / qWord.length };

  // Allow typos based on word length:
  // 3-4 chars: 1 typo (e.g. "hil" -> "hill")
  // 5-7 chars: 1 typo (e.g. "silentt" -> "silent", "slient" -> "silent", "lilla" -> "lila")
  // 8+ chars: 2 typos (e.g. "ragnarock" -> "ragnarok")
  const maxDistance = qWord.length >= 8 ? 2 : (qWord.length >= 3 ? 1 : 0);
  if (maxDistance > 0) {
    const dist = levenshtein(qWord, tWord);
    if (dist <= maxDistance) {
      const similarity = 1 - (dist / Math.max(qWord.length, tWord.length));
      return { match: true, score: similarity * 0.85 };
    }
  }

  return { match: false, score: 0 };
};

// Calculate match score for a review
const calculateFuzzyScore = (review, rawQuery, normalizedQuery, queryTokens) => {
  let score = 0;

  const gameTitle = review.gameTitle || '';
  const title = review.title || '';
  const content = review.content || '';

  const gameTitleNorm = normalizeForSearch(gameTitle);
  const titleNorm = normalizeForSearch(title);
  const gameTokens = getTokens(gameTitle);
  const titleTokens = getTokens(title);
  const contentLower = foldDiacritics(content).toLowerCase();

  // 1. Exact or normalized full match
  if (gameTitleNorm === normalizedQuery) {
    return 1000;
  }
  if (gameTitleNorm.includes(normalizedQuery) && normalizedQuery.length >= 2) {
    score += 600;
  } else if (normalizedQuery.includes(gameTitleNorm) && gameTitleNorm.length >= 2) {
    score += 450;
  }

  if (titleNorm === normalizedQuery) {
    score += 500;
  } else if (titleNorm.includes(normalizedQuery) && normalizedQuery.length >= 2) {
    score += 300;
  }

  // 2. Full title Levenshtein distance (for typos across the entire string)
  if (normalizedQuery.length >= 3 && gameTitleNorm.length >= 3) {
    const fullTitleDist = levenshtein(normalizedQuery, gameTitleNorm);
    const maxFullAllowed = normalizedQuery.length >= 7 ? 2 : 1;
    if (fullTitleDist <= maxFullAllowed) {
      score += (400 - fullTitleDist * 50);
    }
  }

  // 3. Token-by-token fuzzy matching (handles any word order e.g. "f hill silent", "silentt hill")
  if (queryTokens.length > 0) {
    let matchedGameTokensCount = 0;
    let totalGameTokenScore = 0;

    for (const qWord of queryTokens) {
      let bestWordScore = 0;
      for (const gWord of gameTokens) {
        const { match, score: s } = wordFuzzyMatch(qWord, gWord);
        if (match && s > bestWordScore) {
          bestWordScore = s;
        }
      }
      if (bestWordScore > 0) {
        matchedGameTokensCount++;
        totalGameTokenScore += bestWordScore;
      }
    }

    if (matchedGameTokensCount > 0) {
      const matchRatio = matchedGameTokensCount / queryTokens.length;
      if (matchRatio === 1) {
        score += 500 * (totalGameTokenScore / queryTokens.length);
      } else if (matchRatio >= 0.5) {
        score += 250 * matchRatio;
      } else {
        score += 100 * matchRatio;
      }
    }

    // Check review subtitle tokens
    let matchedTitleTokensCount = 0;
    for (const qWord of queryTokens) {
      let bestTitleScore = 0;
      for (const tWord of titleTokens) {
        const { match, score: s } = wordFuzzyMatch(qWord, tWord);
        if (match && s > bestTitleScore) {
          bestTitleScore = s;
        }
      }
      if (bestTitleScore > 0) {
        matchedTitleTokensCount++;
      }
    }
    if (matchedTitleTokensCount > 0) {
      score += 100 * (matchedTitleTokensCount / queryTokens.length);
    }
  }

  // 4. Content match
  if (queryTokens.length > 0) {
    let contentHits = 0;
    for (const qWord of queryTokens) {
      if (qWord.length >= 3 && contentLower.includes(qWord)) {
        contentHits++;
      }
    }
    if (contentHits > 0) {
      score += 30 * (contentHits / queryTokens.length);
    }
  }

  return score;
};

// Search reviews with ultra-flexible fuzzy matching
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
    const queryTokens = getTokens(rawQuery);

    const whereClause = {};
    if (!req.user) {
      whereClause.isDraft = false;
    }

    // Fetch all reviews and score with in-memory Levenshtein & token fuzzy matching
    const allReviews = await Review.findAll({
      where: whereClause,
      include: [
        { model: Genre, as: 'genres', attributes: ['id', 'name', 'slug'] },
        { model: Series, as: 'series', attributes: ['id', 'name', 'slug'] },
        { model: Studio, as: 'studio', attributes: ['id', 'name', 'slug'] },
        { model: CustomRating, as: 'customRatings' }
      ],
      order: [['updatedAt', 'DESC']]
    });

    const scoredReviews = [];
    for (const review of allReviews) {
      const score = calculateFuzzyScore(review, rawQuery, normalizedQuery, queryTokens);
      if (score >= 40) {
        scoredReviews.push({ review, score });
      }
    }

    // Sort by match score descending, then by updatedAt descending
    scoredReviews.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(b.review.updatedAt).getTime() - new Date(a.review.updatedAt).getTime();
    });

    const total = scoredReviews.length;
    const pagedResults = scoredReviews
      .slice(offset, offset + limit)
      .map(item => item.review);

    res.json({
      reviews: pagedResults,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
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
