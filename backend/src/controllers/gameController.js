const { Game, Review, Genre, Series, Studio, CustomRating, User, Favorite, ReadMark, sequelize } = require('../models');
const { Op } = require('sequelize');
const { slugify } = require('../utils/slugify');
const { normalizeForSearch, getTokens, calculateGameFuzzyScore } = require('../utils/searchHelpers');
const { cleanupOrphanedUploads } = require('../utils/cleanupUploads');

// Helper to calculate averages across reviews
const computeGameAverages = (reviews) => {
  const published = reviews.filter(r => !r.isDraft);
  if (published.length === 0) {
    return {
      storyRating: 0,
      musicRating: 0,
      graphicsRating: 0,
      optimizationRating: 0,
      gameplayRating: 0,
      averageRating: 0,
      reviewCount: 0
    };
  }

  const sum = published.reduce((acc, r) => ({
    story: acc.story + (r.storyRating || 0),
    music: acc.music + (r.musicRating || 0),
    graphics: acc.graphics + (r.graphicsRating || 0),
    optimization: acc.optimization + (r.optimizationRating || 0),
    gameplay: acc.gameplay + (r.gameplayRating || 0),
    average: acc.average + (r.averageRating || 0)
  }), { story: 0, music: 0, graphics: 0, optimization: 0, gameplay: 0, average: 0 });

  const count = published.length;
  return {
    storyRating: parseFloat((sum.story / count).toFixed(1)),
    musicRating: parseFloat((sum.music / count).toFixed(1)),
    graphicsRating: parseFloat((sum.graphics / count).toFixed(1)),
    optimizationRating: parseFloat((sum.optimization / count).toFixed(1)),
    gameplayRating: parseFloat((sum.gameplay / count).toFixed(1)),
    averageRating: parseFloat((sum.average / count).toFixed(1)),
    reviewCount: count
  };
};

// GET /api/games - Feed of games
// Query params: page, limit, sort, includeEmpty (for reviewers dashboard)
const getAllGames = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const sort = req.query.sort || 'newest';
    const includeEmpty = req.query.includeEmpty === 'true';

    // Include reviews for calculation
    const reviewWhere = {};
    const isPrivileged = req.user && (req.user.role === 'admin' || req.user.role === 'reviewer');
    if (!isPrivileged) {
      reviewWhere.isDraft = false;
    }

    const games = await Game.findAll({
      include: [
        { model: Genre, as: 'genres', attributes: ['id', 'name', 'slug'] },
        { model: Series, as: 'series', attributes: ['id', 'name', 'slug'] },
        { model: Studio, as: 'studio', attributes: ['id', 'name', 'slug'] },
        { model: User, as: 'createdBy', attributes: ['id', 'username', 'displayName', 'avatarUrl'] },
        {
          model: Review,
          as: 'reviews',
          where: reviewWhere,
          required: false,
          include: [
            { model: User, as: 'author', attributes: ['id', 'username', 'displayName', 'avatarUrl'] }
          ]
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    // Compute stats for each game
    let gameList = games.map(g => {
      const plain = g.toJSON();
      const averages = computeGameAverages(plain.reviews || []);
      const reviewers = (plain.reviews || [])
        .filter(r => !r.isDraft || isPrivileged)
        .map(r => ({
          reviewId: r.id,
          userId: r.author?.id,
          username: r.author?.username,
          displayName: r.author?.displayName || r.author?.username || 'Anonim',
          avatarUrl: r.author?.avatarUrl,
          averageRating: r.averageRating,
          isDraft: r.isDraft,
          updatedAt: r.updatedAt
        }));

      // Find the latest review update time for "newest" sorting
      let latestReviewDate = plain.updatedAt;
      if (plain.reviews && plain.reviews.length > 0) {
        const latestTime = Math.max(...plain.reviews.map(r => new Date(r.updatedAt).getTime()));
        latestReviewDate = new Date(latestTime).toISOString();
      }

      return {
        ...plain,
        ...averages,
        reviewers,
        latestActivity: latestReviewDate
      };
    });

    // If not includeEmpty or guest/reader, only show games with at least 1 review
    if (!includeEmpty && !isPrivileged) {
      gameList = gameList.filter(g => g.reviewCount > 0);
    } else if (!includeEmpty && isPrivileged && req.query.onlyWithReviews === 'true') {
      gameList = gameList.filter(g => g.reviews && g.reviews.length > 0);
    }

    // Sort gameList
    switch (sort) {
      case 'releaseDate':
        gameList.sort((a, b) => {
          if (!a.releaseDate) return 1;
          if (!b.releaseDate) return -1;
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        });
        break;
      case 'ratingHigh':
        gameList.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'ratingLow':
        gameList.sort((a, b) => a.averageRating - b.averageRating);
        break;
      case 'title':
        gameList.sort((a, b) => a.gameTitle.localeCompare(b.gameTitle));
        break;
      case 'newest':
      default:
        gameList.sort((a, b) => new Date(b.latestActivity).getTime() - new Date(a.latestActivity).getTime());
        break;
    }

    const total = gameList.length;
    const paged = gameList.slice(offset, offset + limit);

    res.json({
      games: paged,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all games error:', error);
    res.status(500).json({ error: 'Błąd serwera podczas pobierania gier' });
  }
};

// GET /api/games/:slug - Detailed game view with reviews and reviewers
// Query params: reviewerId (optional, to select specific review)
const getGameBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const isPrivileged = req.user && (req.user.role === 'admin' || req.user.role === 'reviewer');

    const isNumericId = !isNaN(slug) && !isNaN(parseInt(slug, 10));
    const gameWhere = isNumericId ? { [Op.or]: [{ id: parseInt(slug, 10) }, { slug }] } : { slug };

    const game = await Game.findOne({
      where: gameWhere,
      include: [
        { model: Genre, as: 'genres', attributes: ['id', 'name', 'slug'] },
        { model: Series, as: 'series', attributes: ['id', 'name', 'slug'] },
        { model: Studio, as: 'studio', attributes: ['id', 'name', 'slug'] },
        { model: User, as: 'createdBy', attributes: ['id', 'username', 'displayName', 'avatarUrl'] },
        {
          model: Review,
          as: 'reviews',
          include: [
            { model: User, as: 'author', attributes: ['id', 'username', 'displayName', 'avatarUrl'] },
            { model: CustomRating, as: 'customRatings' }
          ]
        }
      ]
    });

    if (!game) {
      return res.status(404).json({ error: 'Gra nie została znaleziona' });
    }

    const plain = game.toJSON();
    const allReviews = plain.reviews || [];
    
    // Filter drafts if not author/admin
    const visibleReviews = allReviews.filter(r => {
      if (!r.isDraft) return true;
      if (req.user && (req.user.role === 'admin' || req.user.id === r.userId)) return true;
      return false;
    });

    if (visibleReviews.length === 0 && !isPrivileged) {
      return res.status(404).json({ error: 'Brak opublikowanych recenzji dla tej gry' });
    }

    const averages = computeGameAverages(visibleReviews);

    // Reviewers list with ratings
    const reviewers = visibleReviews.map(r => ({
      reviewId: r.id,
      userId: r.author?.id,
      username: r.author?.username,
      displayName: r.author?.displayName || r.author?.username || 'Anonim',
      avatarUrl: r.author?.avatarUrl,
      averageRating: r.averageRating,
      isDraft: r.isDraft,
      updatedAt: r.updatedAt
    }));

    // Select review (by query param reviewerId, reviewId, or default to first)
    const targetUserId = parseInt(req.query.reviewerId);
    const targetReviewId = parseInt(req.query.reviewId);
    
    let selectedReview = null;
    if (targetReviewId) {
      selectedReview = visibleReviews.find(r => r.id === targetReviewId) || null;
    } else if (targetUserId) {
      selectedReview = visibleReviews.find(r => r.userId === targetUserId) || null;
    }
    
    if (!selectedReview && visibleReviews.length > 0) {
      selectedReview = visibleReviews[0];
    }

    // Check if favorited or read by current user (if logged in)
    let isFavorite = false;
    let isRead = false;
    if (req.user) {
      const fav = await Favorite.findOne({
        where: { userId: req.user.id, gameId: game.id }
      });
      isFavorite = !!fav;

      if (selectedReview) {
        const read = await ReadMark.findOne({
          where: { userId: req.user.id, reviewId: selectedReview.id }
        });
        isRead = !!read;
      }
    }

    res.json({
      game: {
        id: plain.id,
        gameTitle: plain.gameTitle,
        slug: plain.slug,
        coverImage: plain.coverImage,
        releaseDate: plain.releaseDate,
        soundtrackUrl: plain.soundtrackUrl,
        platforms: plain.platforms || [],
        genres: plain.genres || [],
        series: plain.series || null,
        studio: plain.studio || null,
        createdBy: plain.createdBy,
        createdAt: plain.createdAt,
        updatedAt: plain.updatedAt
      },
      averages,
      reviewers,
      selectedReview,
      isFavorite,
      isRead
    });
  } catch (error) {
    console.error('Get game by slug error:', error);
    res.status(500).json({ error: 'Błąd serwera podczas pobierania gry' });
  }
};

// POST /api/games - Create new Game (Reviewer or Admin)
const createGame = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      gameTitle,
      coverImage,
      releaseDate,
      soundtrackUrl,
      platforms,
      genreIds,
      seriesId,
      studioId
    } = req.body;

    if (!gameTitle || !gameTitle.trim()) {
      return res.status(400).json({ error: 'Tytuł gry jest wymagany' });
    }

    let slug = slugify(gameTitle);
    if (!slug) {
      slug = 'gra-' + Date.now();
    }

    // Ensure unique slug
    let existingGame = await Game.findOne({ where: { slug }, transaction });
    let suffix = 1;
    const baseSlug = slug;
    while (existingGame) {
      slug = `${baseSlug}-${suffix}`;
      existingGame = await Game.findOne({ where: { slug }, transaction });
      suffix++;
    }

    const game = await Game.create({
      gameTitle: gameTitle.trim(),
      slug,
      coverImage: coverImage || null,
      releaseDate: releaseDate || null,
      soundtrackUrl: soundtrackUrl || null,
      platforms: Array.isArray(platforms) ? platforms : [],
      seriesId: seriesId || null,
      studioId: studioId || null,
      createdById: req.user.id
    }, { transaction });

    if (genreIds && genreIds.length > 0) {
      await game.setGenres(genreIds, { transaction });
    }

    await transaction.commit();

    const completeGame = await Game.findByPk(game.id, {
      include: [
        { model: Genre, as: 'genres' },
        { model: Series, as: 'series' },
        { model: Studio, as: 'studio' },
        { model: User, as: 'createdBy', attributes: ['id', 'username', 'displayName', 'avatarUrl'] }
      ]
    });

    res.status(201).json(completeGame);
  } catch (error) {
    await transaction.rollback();
    console.error('Create game error:', error);
    res.status(500).json({ error: 'Błąd serwera podczas tworzenia gry' });
  }
};

// PUT /api/games/:id - Update Game (Any reviewer or admin can edit)
const updateGame = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Gra nie znaleziona' });
    }

    const {
      gameTitle,
      coverImage,
      releaseDate,
      soundtrackUrl,
      platforms,
      genreIds,
      seriesId,
      studioId
    } = req.body;

    let slug = game.slug;
    if (gameTitle && gameTitle.trim() !== game.gameTitle) {
      slug = slugify(gameTitle);
      let existing = await Game.findOne({
        where: { slug, id: { [Op.ne]: game.id } },
        transaction
      });
      let suffix = 1;
      const baseSlug = slug;
      while (existing) {
        slug = `${baseSlug}-${suffix}`;
        existing = await Game.findOne({
          where: { slug, id: { [Op.ne]: game.id } },
          transaction
        });
        suffix++;
      }
    }

    await game.update({
      gameTitle: gameTitle !== undefined ? gameTitle.trim() : game.gameTitle,
      slug,
      coverImage: coverImage !== undefined ? coverImage : game.coverImage,
      releaseDate: releaseDate !== undefined ? (releaseDate || null) : game.releaseDate,
      soundtrackUrl: soundtrackUrl !== undefined ? (soundtrackUrl || null) : game.soundtrackUrl,
      platforms: platforms !== undefined ? (Array.isArray(platforms) ? platforms : []) : game.platforms,
      seriesId: seriesId !== undefined ? (seriesId || null) : game.seriesId,
      studioId: studioId !== undefined ? (studioId || null) : game.studioId
    }, { transaction });

    if (genreIds !== undefined) {
      await game.setGenres(genreIds, { transaction });
    }

    await transaction.commit();

    const updatedGame = await Game.findByPk(game.id, {
      include: [
        { model: Genre, as: 'genres' },
        { model: Series, as: 'series' },
        { model: Studio, as: 'studio' },
        { model: User, as: 'createdBy', attributes: ['id', 'username', 'displayName', 'avatarUrl'] }
      ]
    });

    res.json(updatedGame);
  } catch (error) {
    await transaction.rollback();
    console.error('Update game error:', error);
    res.status(500).json({ error: 'Błąd serwera podczas aktualizacji gry' });
  }
};

// DELETE /api/games/:id - Delete Game & its reviews (Admin only)
const deleteGame = async (req, res) => {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Gra nie znaleziona' });
    }

    // Delete reviews and associated ratings
    const reviews = await Review.findAll({ where: { gameId: game.id } });
    for (const r of reviews) {
      await CustomRating.destroy({ where: { reviewId: r.id } });
      await ReadMark.destroy({ where: { reviewId: r.id } });
      await r.destroy();
    }

    await Favorite.destroy({ where: { gameId: game.id } });
    await game.destroy();

    // Trigger cleanup of orphaned files in background
    cleanupOrphanedUploads(0).catch(err => console.error('Background cleanup error:', err));

    res.json({ message: 'Gra i powiązane recenzje zostały usunięte' });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({ error: 'Błąd serwera podczas usuwania gry' });
  }
};

// GET /api/games/search - Fuzzy search games
const searchGames = async (req, res) => {
  try {
    const rawQuery = (req.query.q || '').trim();
    if (!rawQuery) {
      return res.json({
        games: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const normalizedQuery = normalizeForSearch(rawQuery);
    const queryTokens = getTokens(rawQuery);

    const isPrivileged = req.user && (req.user.role === 'admin' || req.user.role === 'reviewer');
    const reviewWhere = {};
    if (!isPrivileged) {
      reviewWhere.isDraft = false;
    }

    const allGames = await Game.findAll({
      include: [
        { model: Genre, as: 'genres', attributes: ['id', 'name', 'slug'] },
        { model: Series, as: 'series', attributes: ['id', 'name', 'slug'] },
        { model: Studio, as: 'studio', attributes: ['id', 'name', 'slug'] },
        { model: User, as: 'createdBy', attributes: ['id', 'username', 'displayName', 'avatarUrl'] },
        {
          model: Review,
          as: 'reviews',
          where: reviewWhere,
          required: false,
          include: [
            { model: User, as: 'author', attributes: ['id', 'username', 'displayName', 'avatarUrl'] }
          ]
        }
      ]
    });

    const scoredGames = [];
    for (const game of allGames) {
      const plain = game.toJSON();
      
      // Guest can only search games with at least 1 published review
      const publishedReviews = (plain.reviews || []).filter(r => !r.isDraft);
      if (!isPrivileged && publishedReviews.length === 0) {
        continue;
      }

      const score = calculateGameFuzzyScore(plain, rawQuery, normalizedQuery, queryTokens);
      if (score >= 40) {
        const averages = computeGameAverages(plain.reviews || []);
        const reviewers = (plain.reviews || []).map(r => ({
          reviewId: r.id,
          userId: r.author?.id,
          username: r.author?.username,
          displayName: r.author?.displayName || r.author?.username || 'Anonim',
          avatarUrl: r.author?.avatarUrl,
          averageRating: r.averageRating,
          isDraft: r.isDraft
        }));

        scoredGames.push({
          game: {
            ...plain,
            ...averages,
            reviewers
          },
          score
        });
      }
    }

    // Sort by match score descending, then by updatedAt descending
    scoredGames.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(b.game.updatedAt).getTime() - new Date(a.game.updatedAt).getTime();
    });

    const total = scoredGames.length;
    const pagedResults = scoredGames
      .slice(offset, offset + limit)
      .map(item => item.game);

    res.json({
      games: pagedResults,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search games error:', error);
    res.status(500).json({ error: 'Błąd serwera podczas wyszukiwania' });
  }
};

module.exports = {
  getAllGames,
  getGameBySlug,
  createGame,
  updateGame,
  deleteGame,
  searchGames
};
