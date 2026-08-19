const { Studio, Game, Review, Series, Genre, User } = require('../models');
const { slugify } = require('../utils/slugify');

// Get all studios
const getAllStudios = async (req, res) => {
  try {
    const studios = await Studio.findAll({
      order: [['name', 'ASC']]
    });
    res.json(studios);
  } catch (error) {
    console.error('Get all studios error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Get studio by slug
const getStudioBySlug = async (req, res) => {
  try {
    const studio = await Studio.findOne({
      where: { slug: req.params.slug }
    });

    if (!studio) {
      return res.status(404).json({ error: 'Studio nie znalezione' });
    }

    res.json(studio);
  } catch (error) {
    console.error('Get studio by slug error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Get reviews/games by studio slug
const getReviewsByStudio = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const studio = await Studio.findOne({
      where: { slug: req.params.slug }
    });

    if (!studio) {
      return res.status(404).json({ error: 'Studio nie znalezione' });
    }

    const isPrivileged = req.user && (req.user.role === 'admin' || req.user.role === 'reviewer');
    const reviewWhere = {};
    if (!isPrivileged) {
      reviewWhere.isDraft = false;
    }

    const games = await studio.getGames({
      include: [
        { model: Genre, as: 'genres' },
        { model: Series, as: 'series' },
        { model: Studio, as: 'studio' },
        {
          model: Review,
          as: 'reviews',
          where: reviewWhere,
          required: !isPrivileged,
          include: [
            { model: User, as: 'author', attributes: ['id', 'username', 'displayName', 'avatarUrl'] }
          ]
        }
      ],
      order: [['releaseDate', 'DESC NULLS LAST']]
    });

    const gameList = games.map(g => {
      const plain = g.toJSON();
      const published = (plain.reviews || []).filter(r => !r.isDraft);
      const avg = published.length > 0
        ? parseFloat((published.reduce((s, r) => s + (r.averageRating || 0), 0) / published.length).toFixed(1))
        : 0;

      return {
        ...plain,
        averageRating: avg,
        reviewCount: published.length
      };
    });

    const total = gameList.length;
    const paged = gameList.slice(offset, offset + limit);

    res.json({
      studio,
      games: paged,
      reviews: paged,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get reviews by studio error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Create studio (reviewer/admin)
const createStudio = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nazwa studia jest wymagana' });
    }

    const slug = slugify(name);

    const existing = await Studio.findOne({ where: { slug } });
    if (existing) {
      return res.status(400).json({ error: 'Studio o tej nazwie już istnieje' });
    }

    const studio = await Studio.create({ name, slug });
    res.status(201).json(studio);
  } catch (error) {
    console.error('Create studio error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Update studio (reviewer/admin)
const updateStudio = async (req, res) => {
  try {
    const studio = await Studio.findByPk(req.params.id);

    if (!studio) {
      return res.status(404).json({ error: 'Studio nie znalezione' });
    }

    const { name } = req.body;
    const slug = name ? slugify(name) : studio.slug;

    await studio.update({ name: name || studio.name, slug });
    res.json(studio);
  } catch (error) {
    console.error('Update studio error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Delete studio (admin only)
const deleteStudio = async (req, res) => {
  try {
    const studio = await Studio.findByPk(req.params.id);

    if (!studio) {
      return res.status(404).json({ error: 'Studio nie znalezione' });
    }

    const games = await studio.getGames({ attributes: ['id', 'gameTitle'] });
    if (games.length > 0) {
      const names = games.map(g => g.gameTitle).join(', ');
      return res.status(409).json({
        error: `Nie można usunąć studia — jest używane przez gry: ${names}`
      });
    }

    await studio.destroy();
    res.json({ message: 'Studio usunięte pomyślnie' });
  } catch (error) {
    console.error('Delete studio error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

module.exports = {
  getAllStudios,
  getStudioBySlug,
  getReviewsByStudio,
  createStudio,
  updateStudio,
  deleteStudio
};
