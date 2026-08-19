const { Series, Game, Review, Studio, Genre, User } = require('../models');
const { slugify } = require('../utils/slugify');

// Get all series
const getAllSeries = async (req, res) => {
  try {
    const series = await Series.findAll({
      order: [['name', 'ASC']]
    });
    res.json(series);
  } catch (error) {
    console.error('Get all series error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Get series by slug
const getSeriesBySlug = async (req, res) => {
  try {
    const series = await Series.findOne({
      where: { slug: req.params.slug }
    });

    if (!series) {
      return res.status(404).json({ error: 'Seria nie znaleziona' });
    }

    res.json(series);
  } catch (error) {
    console.error('Get series by slug error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Get reviews/games by series slug
const getReviewsBySeries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const series = await Series.findOne({
      where: { slug: req.params.slug }
    });

    if (!series) {
      return res.status(404).json({ error: 'Seria nie znaleziona' });
    }

    const isPrivileged = req.user && (req.user.role === 'admin' || req.user.role === 'reviewer');
    const reviewWhere = {};
    if (!isPrivileged) {
      reviewWhere.isDraft = false;
    }

    const games = await series.getGames({
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
      series,
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
    console.error('Get reviews by series error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Create series (reviewer/admin)
const createSeries = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nazwa serii jest wymagana' });
    }

    const slug = slugify(name);

    const existing = await Series.findOne({ where: { slug } });
    if (existing) {
      return res.status(400).json({ error: 'Seria o tej nazwie już istnieje' });
    }

    const series = await Series.create({ name, slug });
    res.status(201).json(series);
  } catch (error) {
    console.error('Create series error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Update series (reviewer/admin)
const updateSeries = async (req, res) => {
  try {
    const series = await Series.findByPk(req.params.id);

    if (!series) {
      return res.status(404).json({ error: 'Seria nie znaleziona' });
    }

    const { name } = req.body;
    const slug = name ? slugify(name) : series.slug;

    await series.update({ name: name || series.name, slug });
    res.json(series);
  } catch (error) {
    console.error('Update series error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Delete series (admin only)
const deleteSeries = async (req, res) => {
  try {
    const series = await Series.findByPk(req.params.id);

    if (!series) {
      return res.status(404).json({ error: 'Seria nie znaleziona' });
    }

    const games = await series.getGames({ attributes: ['id', 'gameTitle'] });
    if (games.length > 0) {
      const names = games.map(g => g.gameTitle).join(', ');
      return res.status(409).json({
        error: `Nie można usunąć serii — jest używana przez gry: ${names}`
      });
    }

    await series.destroy();
    res.json({ message: 'Seria usunięta pomyślnie' });
  } catch (error) {
    console.error('Delete series error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

module.exports = {
  getAllSeries,
  getSeriesBySlug,
  getReviewsBySeries,
  createSeries,
  updateSeries,
  deleteSeries
};
