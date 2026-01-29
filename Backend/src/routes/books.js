const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  getBookById,
  getFeaturedBooks,
  getBestsellers,
  getNewArrivals,
  getFlashDeals,
  getBooksByCategory,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/book.controller');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllBooks);
router.get('/featured', getFeaturedBooks);
router.get('/bestsellers', getBestsellers);
router.get('/new-arrivals', getNewArrivals);
router.get('/flash/deals', getFlashDeals);
router.get('/category/:category', getBooksByCategory);
router.get('/:id', getBookById);

// Protected admin routes
router.post('/', protect, authorize('admin'), createBook);
router.put('/:id', protect, authorize('admin'), updateBook);
router.delete('/:id', protect, authorize('admin'), deleteBook);

module.exports = router;