const { Series, Review, Genre, Studio, CustomRating } = require('../models');

const slugify = (text) => {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

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

// Get reviews by series slug
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

    const { count, rows } = await Review.findAndCountAll({
      where: { seriesId: series.id },
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
      series,
      reviews: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get reviews by series error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Create series (admin only)
const createSeries = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nazwa serii jest wymagana' });
    }

    const slug = slugify(name);

    const existingSeries = await Series.findOne({ where: { slug } });
    if (existingSeries) {
      return res.status(400).json({ error: 'Seria o tej nazwie już istnieje' });
    }

    const series = await Series.create({ name, slug });
    res.status(201).json(series);
  } catch (error) {
    console.error('Create series error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Update series (admin only)
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

    // Check if any reviews use this series
    const reviews = await Review.findAll({
      where: { seriesId: series.id },
      attributes: ['id', 'title', 'gameTitle']
    });
    if (reviews.length > 0) {
      const reviewNames = reviews.map(r => r.gameTitle || r.title).join(', ');
      return res.status(409).json({
        error: `Nie można usunąć serii — jest używana przez recenzje: ${reviewNames}`
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
