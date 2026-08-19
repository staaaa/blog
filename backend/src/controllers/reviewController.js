const { Review, Game, Genre, Series, Studio, CustomRating, User, sequelize } = require('../models');
const { cleanupOrphanedUploads } = require('../utils/cleanupUploads');

// Calculate average rating including custom ratings
const calculateAverageRating = (review, customRatings = []) => {
  const baseRatings = [
    review.storyRating,
    review.musicRating,
    review.graphicsRating,
    review.optimizationRating,
    review.gameplayRating
  ];
  
  const customValues = (customRatings || []).map(cr => parseFloat(cr.value) || 0);
  const allRatings = [...baseRatings, ...customValues].map(v => parseFloat(v) || 0);
  
  return allRatings.reduce((sum, val) => sum + val, 0) / allRatings.length;
};

// GET /api/reviews/:id - Get single review (or redirect target)
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, {
      include: [
        {
          model: Game,
          as: 'game',
          include: [
            { model: Genre, as: 'genres' },
            { model: Series, as: 'series' },
            { model: Studio, as: 'studio' }
          ]
        },
        { model: User, as: 'author', attributes: ['id', 'username', 'displayName', 'avatarUrl'] },
        { model: CustomRating, as: 'customRatings' }
      ]
    });

    if (!review) {
      return res.status(404).json({ error: 'Recenzja nie znaleziona' });
    }

    const isPrivileged = req.user && (req.user.role === 'admin' || req.user.id === review.userId);
    if (review.isDraft && !isPrivileged) {
      return res.status(404).json({ error: 'Recenzja nie znaleziona' });
    }

    res.json(review);
  } catch (error) {
    console.error('Get review by ID error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// GET /api/reviews/my - Get all reviews by current logged in user
const getMyReviews = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'admin';
    const whereClause = isSuperAdmin ? {} : { userId: req.user.id };

    const reviews = await Review.findAll({
      where: whereClause,
      include: [
        {
          model: Game,
          as: 'game',
          include: [
            { model: Genre, as: 'genres' },
            { model: Series, as: 'series' },
            { model: Studio, as: 'studio' }
          ]
        },
        { model: User, as: 'author', attributes: ['id', 'username', 'displayName', 'avatarUrl'] },
        { model: CustomRating, as: 'customRatings' }
      ],
      order: [['updatedAt', 'DESC']]
    });

    res.json(reviews);
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ error: 'Błąd serwera podczas pobierania recenzji' });
  }
};

// POST /api/reviews - Create review for a game
const createReview = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      gameId,
      title,
      content,
      hardwareSpecs,
      storyRating,
      musicRating,
      graphicsRating,
      optimizationRating,
      gameplayRating,
      customRatings,
      pros,
      cons,
      gameStatus,
      playtimeHours,
      isDraft
    } = req.body;

    if (!gameId) {
      return res.status(400).json({ error: 'ID gry jest wymagane' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Tytuł recenzji jest wymagany' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Treść recenzji jest wymagana' });
    }

    const game = await Game.findByPk(gameId, { transaction });
    if (!game) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Wybrana gra nie istnieje' });
    }

    // Check if user already wrote a review for this game
    const existing = await Review.findOne({
      where: { gameId, userId: req.user.id },
      transaction
    });

    if (existing) {
      await transaction.rollback();
      return res.status(409).json({
        error: 'Napisałeś już recenzję dla tej gry. Możesz ją edytować.',
        existingReviewId: existing.id
      });
    }

    const averageRating = calculateAverageRating(
      { storyRating, musicRating, graphicsRating, optimizationRating, gameplayRating },
      customRatings || []
    );

    const review = await Review.create({
      gameId,
      userId: req.user.id,
      title: title.trim(),
      content,
      hardwareSpecs: hardwareSpecs || null,
      storyRating: parseFloat(storyRating) || 0,
      musicRating: parseFloat(musicRating) || 0,
      graphicsRating: parseFloat(graphicsRating) || 0,
      optimizationRating: parseFloat(optimizationRating) || 0,
      gameplayRating: parseFloat(gameplayRating) || 0,
      averageRating: parseFloat(averageRating.toFixed(1)),
      isDraft: isDraft || false,
      pros: Array.isArray(pros) ? pros : [],
      cons: Array.isArray(cons) ? cons : [],
      gameStatus: gameStatus || 'main_story',
      playtimeHours: typeof playtimeHours === 'number' ? playtimeHours : (parseFloat(playtimeHours) || 0)
    }, { transaction });

    if (customRatings && customRatings.length > 0) {
      await CustomRating.bulkCreate(
        customRatings.map(cr => ({
          reviewId: review.id,
          scaleName: cr.scaleName,
          value: parseFloat(cr.value) || 0
        })),
        { transaction }
      );
    }

    await transaction.commit();

    const completeReview = await Review.findByPk(review.id, {
      include: [
        { model: Game, as: 'game' },
        { model: User, as: 'author', attributes: ['id', 'username', 'displayName', 'avatarUrl'] },
        { model: CustomRating, as: 'customRatings' }
      ]
    });

    res.status(201).json(completeReview);
  } catch (error) {
    await transaction.rollback();
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Błąd serwera podczas tworzenia recenzji' });
  }
};

// PUT /api/reviews/:id - Update review
const updateReview = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Recenzja nie znaleziona' });
    }

    // Permission check: author or admin
    if (req.user.role !== 'admin' && review.userId !== req.user.id) {
      return res.status(403).json({ error: 'Możesz edytować tylko własne recenzje' });
    }

    const {
      title,
      content,
      hardwareSpecs,
      storyRating,
      musicRating,
      graphicsRating,
      optimizationRating,
      gameplayRating,
      customRatings,
      isDraft,
      pros,
      cons,
      gameStatus,
      playtimeHours
    } = req.body;

    const newRatings = { 
      storyRating: storyRating !== undefined ? storyRating : review.storyRating,
      musicRating: musicRating !== undefined ? musicRating : review.musicRating,
      graphicsRating: graphicsRating !== undefined ? graphicsRating : review.graphicsRating,
      optimizationRating: optimizationRating !== undefined ? optimizationRating : review.optimizationRating,
      gameplayRating: gameplayRating !== undefined ? gameplayRating : review.gameplayRating
    };

    const averageRating = calculateAverageRating(newRatings, customRatings || []);

    await review.update({
      title: title !== undefined ? title : review.title,
      content: content !== undefined ? content : review.content,
      hardwareSpecs: hardwareSpecs !== undefined ? hardwareSpecs : review.hardwareSpecs,
      storyRating: newRatings.storyRating,
      musicRating: newRatings.musicRating,
      graphicsRating: newRatings.graphicsRating,
      optimizationRating: newRatings.optimizationRating,
      gameplayRating: newRatings.gameplayRating,
      averageRating: parseFloat(averageRating.toFixed(1)),
      isDraft: isDraft !== undefined ? isDraft : review.isDraft,
      pros: pros !== undefined ? (Array.isArray(pros) ? pros : []) : review.pros,
      cons: cons !== undefined ? (Array.isArray(cons) ? cons : []) : review.cons,
      gameStatus: gameStatus !== undefined ? gameStatus : review.gameStatus,
      playtimeHours: playtimeHours !== undefined ? (typeof playtimeHours === 'number' ? playtimeHours : (parseFloat(playtimeHours) || 0)) : review.playtimeHours
    }, { transaction });

    if (customRatings !== undefined) {
      await CustomRating.destroy({ where: { reviewId: review.id }, transaction });
      if (customRatings.length > 0) {
        await CustomRating.bulkCreate(
          customRatings.map(cr => ({
            reviewId: review.id,
            scaleName: cr.scaleName,
            value: parseFloat(cr.value) || 0
          })),
          { transaction }
        );
      }
    }

    await transaction.commit();

    const updatedReview = await Review.findByPk(review.id, {
      include: [
        { model: Game, as: 'game' },
        { model: User, as: 'author', attributes: ['id', 'username', 'displayName', 'avatarUrl'] },
        { model: CustomRating, as: 'customRatings' }
      ]
    });

    res.json(updatedReview);
  } catch (error) {
    await transaction.rollback();
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Błąd serwera podczas aktualizacji recenzji' });
  }
};

// DELETE /api/reviews/:id - Delete review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Recenzja nie znaleziona' });
    }

    if (req.user.role !== 'admin' && review.userId !== req.user.id) {
      return res.status(403).json({ error: 'Możesz usuwać tylko własne recenzje' });
    }

    await CustomRating.destroy({ where: { reviewId: review.id } });
    await review.destroy();

    // Trigger cleanup of orphaned files in background
    cleanupOrphanedUploads(0).catch(err => console.error('Background cleanup error:', err));

    res.json({ message: 'Recenzja usunięta pomyślnie' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Błąd serwera podczas usuwania recenzji' });
  }
};

module.exports = {
  getReviewById,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview
};
