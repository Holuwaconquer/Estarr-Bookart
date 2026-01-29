const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/book/:bookId', reviewController.getBookReviews);
router.post('/:id/helpful', reviewController.markHelpful);
router.post('/:id/unhelpful', reviewController.markUnhelpful);

// Protected routes
router.post('/', protect, reviewController.addReview);
router.get('/my-reviews', protect, reviewController.getMyReviews);
router.put('/:id', protect, reviewController.updateReview);
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;
