const express = require('express');
const router = express.Router();
const {
  getAllSeries,
  getSeriesBySlug,
  getReviewsBySeries,
  createSeries,
  updateSeries,
  deleteSeries
} = require('../controllers/seriesController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', getAllSeries);
router.get('/:slug', getSeriesBySlug);
router.get('/:slug/reviews', getReviewsBySeries);

// Protected routes (admin only)
router.post('/', authMiddleware, createSeries);
router.put('/:id', authMiddleware, updateSeries);
router.delete('/:id', authMiddleware, deleteSeries);

module.exports = router;
