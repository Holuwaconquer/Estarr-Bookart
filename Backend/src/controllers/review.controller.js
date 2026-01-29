const Review = require('../models/Review');
const Order = require('../models/Order');
const Book = require('../models/Book');
const ApiResponse = require('../utils/apiResponse');

// @desc    Add review to order
// @route   POST /api/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    const { orderId, bookId, rating, title, comment } = req.body;
    const userId = req.userId;

    // Validate required fields
    if (!orderId || !bookId || !rating || !title || !comment) {
      return ApiResponse.error(res, 'All fields are required', 400);
    }

    // Validate rating
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return ApiResponse.error(res, 'Rating must be a number between 1 and 5', 400);
    }

    // Check if order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return ApiResponse.error(res, 'Order not found', 404);
    }

    if (order.user.toString() !== userId) {
      return ApiResponse.error(res, 'Not authorized', 403);
    }

    // Check if book is in the order
    const bookInOrder = order.items.some(item => item.book.toString() === bookId);
    if (!bookInOrder) {
      return ApiResponse.error(res, 'Book not found in this order', 400);
    }

    // Check if user already reviewed this book in this order
    const existingReview = await Review.findOne({
      order: orderId,
      user: userId,
      book: bookId
    });

    if (existingReview) {
      return ApiResponse.error(res, 'You have already reviewed this book in this order', 400);
    }

    // Create review
    const review = await Review.create({
      order: orderId,
      user: userId,
      book: bookId,
      rating,
      title: title.trim(),
      comment: comment.trim(),
      isVerifiedPurchase: true
    });

    await review.populate('user', 'name');

    return ApiResponse.success(res, 'Review added successfully', review, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a book
// @route   GET /api/reviews/book/:bookId
// @access  Public
exports.getBookReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'recent' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortObj = sortBy === 'helpful' ? { helpful: -1 } : { createdAt: -1 };

    const [reviews, total, book] = await Promise.all([
      Review.find({ book: req.params.bookId })
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate('user', 'name'),
      Review.countDocuments({ book: req.params.bookId }),
      Book.findById(req.params.bookId, 'title rating')
    ]);

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    return ApiResponse.success(res, 'Reviews retrieved successfully', {
      book: {
        id: book?._id,
        title: book?.title,
        averageRating: avgRating,
        totalReviews: total
      },
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
exports.getMyReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      Review.find({ user: req.userId })
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .populate('book', 'title author image')
        .populate('order', 'orderNumber'),
      Review.countDocuments({ user: req.userId })
    ]);

    return ApiResponse.success(res, 'Reviews retrieved successfully', {
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;
    const userId = req.userId;

    let review = await Review.findById(req.params.id);

    if (!review) {
      return ApiResponse.error(res, 'Review not found', 404);
    }

    // Check ownership
    if (review.user.toString() !== userId) {
      return ApiResponse.error(res, 'Not authorized', 403);
    }

    // Update fields
    if (rating !== undefined) {
      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        return ApiResponse.error(res, 'Rating must be a number between 1 and 5', 400);
      }
      review.rating = rating;
    }

    if (title) review.title = title.trim();
    if (comment) review.comment = comment.trim();

    review = await review.save();
    await review.populate('user', 'name');

    return ApiResponse.success(res, 'Review updated successfully', review);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return ApiResponse.error(res, 'Review not found', 404);
    }

    // Check ownership
    if (review.user.toString() !== req.userId) {
      return ApiResponse.error(res, 'Not authorized', 403);
    }

    await Review.findByIdAndDelete(req.params.id);

    return ApiResponse.success(res, 'Review deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Public
exports.markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return ApiResponse.error(res, 'Review not found', 404);
    }

    review.helpful += 1;
    await review.save();

    return ApiResponse.success(res, 'Review marked as helpful', { helpful: review.helpful });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark review as unhelpful
// @route   POST /api/reviews/:id/unhelpful
// @access  Public
exports.markUnhelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return ApiResponse.error(res, 'Review not found', 404);
    }

    review.unhelpful += 1;
    await review.save();

    return ApiResponse.success(res, 'Review marked as unhelpful', { unhelpful: review.unhelpful });
  } catch (error) {
    next(error);
  }
};
