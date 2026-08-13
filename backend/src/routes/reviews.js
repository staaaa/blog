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
const authOptionalMiddleware = require('../middleware/authOptional');

// Public routes (with optional auth to detect logged in admin)
router.get('/', authOptionalMiddleware, getAllReviews);
router.get('/search', authOptionalMiddleware, searchReviews);
router.get('/:id', authOptionalMiddleware, getReviewById);

// Protected routes (admin only)
router.post('/', authMiddleware, createReview);
router.put('/:id', authMiddleware, updateReview);
router.delete('/:id', authMiddleware, deleteReview);

module.exports = router;
