const express = require('express');
const router = express.Router();
const {
  getAllGenres,
  getGenreBySlug,
  getReviewsByGenre,
  createGenre,
  updateGenre,
  deleteGenre
} = require('../controllers/genreController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', getAllGenres);
router.get('/:slug', getGenreBySlug);
router.get('/:slug/reviews', getReviewsByGenre);

// Protected routes (admin only)
router.post('/', authMiddleware, createGenre);
router.put('/:id', authMiddleware, updateGenre);
router.delete('/:id', authMiddleware, deleteGenre);

module.exports = router;
