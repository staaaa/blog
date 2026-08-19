const express = require('express');
const router = express.Router();
const {
  getAllGames,
  getGameBySlug,
  createGame,
  updateGame,
  deleteGame,
  searchGames
} = require('../controllers/gameController');
const authMiddleware = require('../middleware/auth');
const authOptionalMiddleware = require('../middleware/authOptional');
const authorize = require('../middleware/authorize');

router.get('/', authOptionalMiddleware, getAllGames);
router.get('/search', authOptionalMiddleware, searchGames);
router.get('/:slug', authOptionalMiddleware, getGameBySlug);

// Reviewer or Admin can create and update games
router.post('/', authMiddleware, authorize('reviewer'), createGame);
router.put('/:id', authMiddleware, authorize('reviewer'), updateGame);

// Admin only can delete games
router.delete('/:id', authMiddleware, authorize('admin'), deleteGame);

module.exports = router;
