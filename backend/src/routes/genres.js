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
const authOptionalMiddleware = require('../middleware/authOptional');
const authorize = require('../middleware/authorize');

router.get('/', getAllGenres);
router.get('/:slug', getGenreBySlug);
router.get('/:slug/reviews', authOptionalMiddleware, getReviewsByGenre);

router.post('/', authMiddleware, authorize('reviewer'), createGenre);
router.put('/:id', authMiddleware, authorize('reviewer'), updateGenre);
router.delete('/:id', authMiddleware, authorize('admin'), deleteGenre);

module.exports = router;
