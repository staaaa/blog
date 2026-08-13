const { Studio, Review, Genre, Series, CustomRating } = require('../models');

const slugify = (text) => {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

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

// Get reviews by studio slug
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

    const whereOptions = { studioId: studio.id };
    if (!req.user) {
      whereOptions.isDraft = false;
    }

    const { count, rows } = await Review.findAndCountAll({
      where: whereOptions,
      include: [
        { model: Genre, as: 'genres', attributes: ['id', 'name', 'slug'] },
        { model: Series, as: 'series', attributes: ['id', 'name', 'slug'] },
        { model: Studio, as: 'studio', attributes: ['id', 'name', 'slug'] },
        { model: CustomRating, as: 'customRatings' }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      studio,
      reviews: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get reviews by studio error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Create studio (admin only)
const createStudio = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nazwa studia jest wymagana' });
    }

    const slug = slugify(name);

    const existingStudio = await Studio.findOne({ where: { slug } });
    if (existingStudio) {
      return res.status(400).json({ error: 'Studio o tej nazwie już istnieje' });
    }

    const studio = await Studio.create({ name, slug });
    res.status(201).json(studio);
  } catch (error) {
    console.error('Create studio error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Update studio (admin only)
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

    // Check if any reviews use this studio
    const reviews = await Review.findAll({
      where: { studioId: studio.id },
      attributes: ['id', 'title', 'gameTitle']
    });
    if (reviews.length > 0) {
      const reviewNames = reviews.map(r => r.gameTitle || r.title).join(', ');
      return res.status(409).json({
        error: `Nie można usunąć studia — jest używane przez recenzje: ${reviewNames}`
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
