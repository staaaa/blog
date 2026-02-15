const express = require('express');
const router = express.Router();
const {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  searchReviews
} = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', getAllReviews);
router.get('/search', searchReviews);
router.get('/:id', getReviewById);

// Protected routes (admin only)
router.post('/', authMiddleware, createReview);
router.put('/:id', authMiddleware, updateReview);
router.delete('/:id', authMiddleware, deleteReview);

module.exports = router;
