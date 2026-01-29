const Category = require('../models/Category');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getAllCategories = async (req, res, next) => {
  try {
    const { isActive = true, sort = 'order' } = req.query;
    
    const query = {};
    if (isActive !== 'false') {
      query.isActive = true;
    }

    const categories = await Category.find(query)
      .sort(sort)
      .select('-__v');

    return ApiResponse.success(res, 'Categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).select('-__v');
    
    if (!category) {
      return ApiResponse.error(res, 'Category not found', 404);
    }

    return ApiResponse.success(res, 'Category retrieved successfully', category);
  } catch (error) {
    next(error);
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug }).select('-__v');
    
    if (!category) {
      return ApiResponse.error(res, 'Category not found', 404);
    }

    return ApiResponse.success(res, 'Category retrieved successfully', category);
  } catch (error) {
    next(error);
  }
};

// @desc    Create category (Admin only)
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, color, order } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingCategory) {
      return ApiResponse.error(res, 'Category already exists', 409);
    }

    const category = await Category.create({
      name,
      description,
      icon: icon || '📚',
      color: color || 'from-blue-500 to-cyan-500',
      order: order || 0
    });

    return ApiResponse.success(res, 'Category created successfully', category, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update category (Admin only)
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, description, icon, color, order, isActive } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(description && { description }),
        ...(icon && { icon }),
        ...(color && { color }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive })
      },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!category) {
      return ApiResponse.error(res, 'Category not found', 404);
    }

    return ApiResponse.success(res, 'Category updated successfully', category);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category (Admin only)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return ApiResponse.error(res, 'Category not found', 404);
    }

    return ApiResponse.success(res, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin categories
// @route   GET /api/categories/admin/all
// @access  Private/Admin
exports.getAdminCategories = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .sort('order')
      .select('-__v');

    return ApiResponse.success(res, 'Categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};
