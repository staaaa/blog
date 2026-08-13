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

// Public routes
router.get('/', getAllStudios);
router.get('/:slug', getStudioBySlug);
router.get('/:slug/reviews', authOptionalMiddleware, getReviewsByStudio);

// Protected routes (admin only)
router.post('/', authMiddleware, createStudio);
router.put('/:id', authMiddleware, updateStudio);
router.delete('/:id', authMiddleware, deleteStudio);

module.exports = router;
