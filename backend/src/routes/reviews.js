const express = require('express');
const router = express.Router();
const {
  getReviewById,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');
const authOptionalMiddleware = require('../middleware/authOptional');
const authorize = require('../middleware/authorize');

router.get('/my', authMiddleware, getMyReviews);
router.get('/:id', authOptionalMiddleware, getReviewById);

// Reviewer or Admin can write, edit, delete reviews
router.post('/', authMiddleware, authorize('reviewer'), createReview);
router.put('/:id', authMiddleware, authorize('reviewer'), updateReview);
router.delete('/:id', authMiddleware, authorize('reviewer'), deleteReview);

module.exports = router;
