const express = require('express');
const router = express.Router();
const {
  getReviewById,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
  toggleLike,
  getComments,
  createComment,
  deleteComment
} = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');
const authOptionalMiddleware = require('../middleware/authOptional');
const authorize = require('../middleware/authorize');

router.get('/my', authMiddleware, getMyReviews);
router.get('/:id', authOptionalMiddleware, getReviewById);

// Likes
router.post('/:id/like', authMiddleware, toggleLike);

// Comments
router.get('/:id/comments', getComments);
router.post('/:id/comments', authMiddleware, createComment);
router.delete('/comments/:commentId', authMiddleware, deleteComment);

// Reviewer or Admin can write, edit, delete reviews
router.post('/', authMiddleware, authorize('reviewer'), createReview);
router.put('/:id', authMiddleware, authorize('reviewer'), updateReview);
router.delete('/:id', authMiddleware, authorize('reviewer'), deleteReview);

module.exports = router;
