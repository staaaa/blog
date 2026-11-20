const { User, Game, Review, Genre, Series, Studio } = require('../models');

// GET /api/authors/:username - Public author profile and their reviews
const getAuthorProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    // 1. Find author
    const author = await User.findOne({
      where: { username },
      attributes: ['id', 'username', 'displayName', 'avatarUrl', 'role', 'bio', 'createdAt']
    });

    if (!author) {
      return res.status(404).json({ error: 'Recenzent nie został znaleziony' });
    }

    // 2. Determine visibility (authors/admins can see drafts)
    const isOwnerOrAdmin = req.user && (req.user.role === 'admin' || req.user.id === author.id);
    const reviewWhere = { userId: author.id };
    if (!isOwnerOrAdmin) {
      reviewWhere.isDraft = false;
    }

    // 3. Find all reviews by this author
    const authorReviews = await Review.findAll({
      where: reviewWhere,
      include: [
        {
          model: Game,
          as: 'game',
          include: [
            { model: Genre, as: 'genres' },
            { model: Series, as: 'series' },
            { model: Studio, as: 'studio' },
            {
              model: Review,
              as: 'reviews',
              attributes: ['id', 'isDraft', 'averageRating', 'updatedAt'],
              where: !isOwnerOrAdmin ? { isDraft: false } : {},
              required: false,
              include: [
                { model: User, as: 'author', attributes: ['id', 'username', 'displayName', 'avatarUrl'] }
              ]
            }
          ]
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    // 4. Calculate stats
    const publishedOnly = authorReviews.filter(r => !r.isDraft);
    const statsReviews = isOwnerOrAdmin ? authorReviews : publishedOnly;
    const totalReviews = statsReviews.length;
    const totalRatingSum = statsReviews.reduce((sum, r) => sum + (r.averageRating || 0), 0);
    const averageRating = totalReviews > 0
      ? parseFloat((totalRatingSum / totalReviews).toFixed(1))
      : 0;

    // 5. Format game cards
    const gameList = authorReviews.map(r => {
      const g = r.game ? r.game.toJSON() : {};
      const allGameReviews = (g.reviews || []).filter(rev => !rev.isDraft || isOwnerOrAdmin);
      const gameAvg = allGameReviews.length > 0
        ? parseFloat((allGameReviews.reduce((s, rev) => s + (rev.averageRating || 0), 0) / allGameReviews.length).toFixed(1))
        : 0;

      const reviewers = allGameReviews.map(rev => ({
        reviewId: rev.id,
        userId: rev.author?.id,
        username: rev.author?.username,
        displayName: rev.author?.displayName || rev.author?.username || 'Anonim',
        avatarUrl: rev.author?.avatarUrl,
        averageRating: rev.averageRating
      }));

      return {
        ...g,
        authorReviewId: r.id,
        authorRating: r.averageRating,
        authorIsDraft: r.isDraft,
        reviewDate: r.updatedAt,
        averageRating: gameAvg,
        reviewCount: allGameReviews.length,
        reviewers
      };
    });

    // 6. Pagination
    const total = gameList.length;
    const pagedGames = gameList.slice(offset, offset + limit);

    res.json({
      author: {
        id: author.id,
        username: author.username,
        displayName: author.displayName || author.username,
        avatarUrl: author.avatarUrl,
        role: author.role,
        bio: author.bio,
        createdAt: author.createdAt
      },
      stats: {
        totalReviews,
        averageRating
      },
      games: pagedGames,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get author profile error:', error);
    res.status(500).json({ error: 'Błąd serwera podczas pobierania profilu recenzenta' });
  }
};

module.exports = {
  getAuthorProfile
};
