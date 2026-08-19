const express = require('express');
const router = express.Router();
const {
  updateProfile,
  changePassword,
  getFavorites,
  toggleFavorite,
  getReadMarks,
  toggleReadMark
} = require('../controllers/accountController');
const authMiddleware = require('../middleware/auth');

// All account routes require authentication
router.use(authMiddleware);

router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.get('/favorites', getFavorites);
router.post('/favorites/:gameId', toggleFavorite);
router.get('/read', getReadMarks);
router.post('/read/:reviewId', toggleReadMark);

module.exports = router;
