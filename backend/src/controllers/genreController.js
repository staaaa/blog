const { Genre, Review, CustomRating, Series, Studio } = require('../models');

const slugify = (text) => {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

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

// Get genre by slug with its reviews
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

// Get reviews by genre slug
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

    const queryOptions = {
      include: [
        { model: Genre, as: 'genres', attributes: ['id', 'name', 'slug'] },
        { model: Series, as: 'series', attributes: ['id', 'name', 'slug'] },
        { model: Studio, as: 'studio', attributes: ['id', 'name', 'slug'] },
        { model: CustomRating, as: 'customRatings' }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    };

    const countOptions = {};

    if (!req.user) {
      queryOptions.where = { isDraft: false };
      countOptions.where = { isDraft: false };
    }

    const reviews = await genre.getReviews(queryOptions);
    const count = await genre.countReviews(countOptions);

    res.json({
      genre,
      reviews,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get reviews by genre error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Create genre (admin only)
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

// Update genre (admin only)
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

    // Check if any reviews use this genre
    const reviews = await genre.getReviews({ attributes: ['id', 'title', 'gameTitle'] });
    if (reviews.length > 0) {
      const reviewNames = reviews.map(r => r.gameTitle || r.title).join(', ');
      return res.status(409).json({
        error: `Nie można usunąć gatunku — jest używany przez recenzje: ${reviewNames}`
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
