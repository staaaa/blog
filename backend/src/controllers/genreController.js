const { Genre, Game, Review, Studio, Series, User } = require('../models');
const { slugify } = require('../utils/slugify');

// Get all genres
const getAllGenres = async (req, res) => {
  try {
    const genres = await Genre.findAll({
      order: [['name', 'ASC']]
    });
    res.json(genres);
  } catch (error) {
    console.error('Get all genres error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Get genre by slug
const getGenreBySlug = async (req, res) => {
  try {
    const genre = await Genre.findOne({
      where: { slug: req.params.slug }
    });

    if (!genre) {
      return res.status(404).json({ error: 'Gatunek nie znaleziony' });
    }

    res.json(genre);
  } catch (error) {
    console.error('Get genre by slug error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Get games/reviews by genre slug
const getReviewsByGenre = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const genre = await Genre.findOne({
      where: { slug: req.params.slug }
    });

    if (!genre) {
      return res.status(404).json({ error: 'Gatunek nie znaleziony' });
    }

    const isPrivileged = req.user && (req.user.role === 'admin' || req.user.role === 'reviewer');
    const reviewWhere = {};
    if (!isPrivileged) {
      reviewWhere.isDraft = false;
    }

    const games = await genre.getGames({
      include: [
        { model: Genre, as: 'genres' },
        { model: Series, as: 'series' },
        { model: Studio, as: 'studio' },
        {
          model: Review,
          as: 'reviews',
          where: reviewWhere,
          required: !isPrivileged, // only games with reviews for guests
          include: [
            { model: User, as: 'author', attributes: ['id', 'username', 'displayName', 'avatarUrl'] }
          ]
        }
      ],
      order: [['updatedAt', 'DESC']]
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
      genre,
      games: paged,
      reviews: paged, // For backward compatibility with category-view components
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get reviews by genre error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Create genre (reviewer/admin)
const createGenre = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nazwa gatunku jest wymagana' });
    }

    const slug = slugify(name);

    const existingGenre = await Genre.findOne({ where: { slug } });
    if (existingGenre) {
      return res.status(400).json({ error: 'Gatunek o tej nazwie już istnieje' });
    }

    const genre = await Genre.create({ name, slug });
    res.status(201).json(genre);
  } catch (error) {
    console.error('Create genre error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Update genre (reviewer/admin)
const updateGenre = async (req, res) => {
  try {
    const genre = await Genre.findByPk(req.params.id);

    if (!genre) {
      return res.status(404).json({ error: 'Gatunek nie znaleziony' });
    }

    const { name } = req.body;
    const slug = name ? slugify(name) : genre.slug;

    await genre.update({ name: name || genre.name, slug });
    res.json(genre);
  } catch (error) {
    console.error('Update genre error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Delete genre (admin only)
const deleteGenre = async (req, res) => {
  try {
    const genre = await Genre.findByPk(req.params.id);

    if (!genre) {
      return res.status(404).json({ error: 'Gatunek nie znaleziony' });
    }

    // Check if any games use this genre
    const games = await genre.getGames({ attributes: ['id', 'gameTitle'] });
    if (games.length > 0) {
      const names = games.map(g => g.gameTitle).join(', ');
      return res.status(409).json({
        error: `Nie można usunąć gatunku — jest używany przez gry: ${names}`
      });
    }

    await genre.destroy();
    res.json({ message: 'Gatunek usunięty pomyślnie' });
  } catch (error) {
    console.error('Delete genre error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

module.exports = {
  getAllGenres,
  getGenreBySlug,
  getReviewsByGenre,
  createGenre,
  updateGenre,
  deleteGenre
};
