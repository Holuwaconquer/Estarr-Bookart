const Book = require('../models/Book');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
exports.getAllBooks = async (req, res, next) => {
  try {
    const { 
      category, 
      featured, 
      bestseller, 
      minPrice, 
      maxPrice,
      search,
      page = 1,
      limit = 12,
      sort = '-createdAt'
    } = req.query;

    const query = {};
    
    // Build query
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (bestseller === 'true') query.isBestseller = true;
    
    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [books, total] = await Promise.all([
      Book.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .select('-__v'),
      Book.countDocuments(query)
    ]);

    // Calculate final price for each book
    const booksWithFinalPrice = books.map(book => ({
      ...book.toObject(),
      finalPrice: book.finalPrice
    }));

    return ApiResponse.success(res, 'Books retrieved successfully', {
      books: booksWithFinalPrice,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
exports.getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).select('-__v');
    
    if (!book) {
      return ApiResponse.error(res, 'Book not found', 404);
    }

    const bookWithFinalPrice = {
      ...book.toObject(),
      finalPrice: book.finalPrice
    };

    return ApiResponse.success(res, 'Book retrieved successfully', bookWithFinalPrice);
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured books
// @route   GET /api/books/featured
// @access  Public
exports.getFeaturedBooks = async (req, res, next) => {
  try {
    const books = await Book.find({ isFeatured: true })
      .sort('-createdAt')
      .limit(8)
      .select('-__v');

    const booksWithFinalPrice = books.map(book => ({
      ...book.toObject(),
      finalPrice: book.finalPrice
    }));

    return ApiResponse.success(res, 'Featured books retrieved', booksWithFinalPrice);
  } catch (error) {
    next(error);
  }
};

// @desc    Get bestseller books
// @route   GET /api/books/bestsellers
// @access  Public
exports.getBestsellers = async (req, res, next) => {
  try {
    const books = await Book.find({ isBestseller: true })
      .sort('-rating')
      .limit(8)
      .select('-__v');

    const booksWithFinalPrice = books.map(book => ({
      ...book.toObject(),
      finalPrice: book.finalPrice
    }));

    return ApiResponse.success(res, 'Bestsellers retrieved', booksWithFinalPrice);
  } catch (error) {
    next(error);
  }
};

// @desc    Get new arrivals
// @route   GET /api/books/new-arrivals
// @access  Public
exports.getNewArrivals = async (req, res, next) => {
  try {
    const books = await Book.find()
      .sort('-createdAt')
      .limit(8)
      .select('-__v');

    const booksWithFinalPrice = books.map(book => ({
      ...book.toObject(),
      finalPrice: book.finalPrice
    }));

    return ApiResponse.success(res, 'New arrivals retrieved', booksWithFinalPrice);
  } catch (error) {
    next(error);
  }
};

// @desc    Get books by category
// @route   GET /api/books/category/:category
// @access  Public
exports.getBooksByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [books, total] = await Promise.all([
      Book.find({ category })
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .select('-__v'),
      Book.countDocuments({ category })
    ]);

    const booksWithFinalPrice = books.map(book => ({
      ...book.toObject(),
      finalPrice: book.finalPrice
    }));

    return ApiResponse.success(res, 'Category books retrieved', {
      books: booksWithFinalPrice,
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

// @desc    Get flash deals (books with highest discounts)
// @route   GET /api/books/flash/deals
// @access  Public
exports.getFlashDeals = async (req, res, next) => {
  try {
    const { limit = 4 } = req.query;

    const books = await Book.find({ discount: { $gt: 0 } })
      .sort('-discount')
      .limit(parseInt(limit))
      .select('-__v');

    const booksWithFinalPrice = books.map(book => ({
      ...book.toObject(),
      finalPrice: book.finalPrice
    }));

    return ApiResponse.success(res, 'Flash deals retrieved', booksWithFinalPrice);
  } catch (error) {
    next(error);
  }
};

// @desc    Create book (Admin only)
// @route   POST /api/books
// @access  Private/Admin
exports.createBook = async (req, res, next) => {
  try {
    const book = await Book.create(req.body);

    return ApiResponse.success(res, 'Book created successfully', book, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update book (Admin only)
// @route   PUT /api/books/:id
// @access  Private/Admin
exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!book) {
      return ApiResponse.error(res, 'Book not found', 404);
    }

    return ApiResponse.success(res, 'Book updated successfully', book);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete book (Admin only)
// @route   DELETE /api/books/:id
// @access  Private/Admin
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return ApiResponse.error(res, 'Book not found', 404);
    }

    return ApiResponse.success(res, 'Book deleted successfully');
  } catch (error) {
    next(error);
  }
};