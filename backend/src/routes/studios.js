const express = require('express');
const router = express.Router();
const {
  getAllStudios,
  getStudioBySlug,
  getReviewsByStudio,
  createStudio,
  updateStudio,
  deleteStudio
} = require('../controllers/studioController');
const authMiddleware = require('../middleware/auth');
const authOptionalMiddleware = require('../middleware/authOptional');
const authorize = require('../middleware/authorize');

router.get('/', getAllStudios);
router.get('/:slug', getStudioBySlug);
router.get('/:slug/reviews', authOptionalMiddleware, getReviewsByStudio);

router.post('/', authMiddleware, authorize('reviewer'), createStudio);
router.put('/:id', authMiddleware, authorize('reviewer'), updateStudio);
router.delete('/:id', authMiddleware, authorize('admin'), deleteStudio);

module.exports = router;
