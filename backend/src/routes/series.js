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
const authOptionalMiddleware = require('../middleware/authOptional');
const authorize = require('../middleware/authorize');

router.get('/', getAllSeries);
router.get('/:slug', getSeriesBySlug);
router.get('/:slug/reviews', authOptionalMiddleware, getReviewsBySeries);

router.post('/', authMiddleware, authorize('reviewer'), createSeries);
router.put('/:id', authMiddleware, authorize('reviewer'), updateSeries);
router.delete('/:id', authMiddleware, authorize('admin'), deleteSeries);

module.exports = router;
