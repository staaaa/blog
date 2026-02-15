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

// Public routes
router.get('/', getAllStudios);
router.get('/:slug', getStudioBySlug);
router.get('/:slug/reviews', getReviewsByStudio);

// Protected routes (admin only)
router.post('/', authMiddleware, createStudio);
router.put('/:id', authMiddleware, updateStudio);
router.delete('/:id', authMiddleware, deleteStudio);

module.exports = router;
