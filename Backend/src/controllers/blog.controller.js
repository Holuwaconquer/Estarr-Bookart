const Blog = require('../models/Blog');
const ApiResponse = require('../utils/apiResponse');

// @desc    Create new blog post (Admin only)
// @route   POST /api/blog
// @access  Private/Admin
exports.createBlog = async (req, res, next) => {
  try {
    const { title, content, excerpt, category, tags, featuredImage, published } = req.body;
    const userId = req.userId;

    // Validate required fields
    if (!title || !content) {
      return ApiResponse.error(res, 'Title and content are required', 400);
    }

    const blog = await Blog.create({
      title,
      content,
      excerpt: excerpt || content.substring(0, 200),
      category: category || 'other',
      tags: tags || [],
      featuredImage,
      author: userId,
      published: published || false,
      publishedAt: published ? new Date() : null
    });

    await blog.populate('author', 'name email');

    return ApiResponse.success(res, 'Blog post created successfully', blog, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all blog posts (Public - only published)
// @route   GET /api/blog
// @access  Public
exports.getAllBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = { published: true };
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort('-publishedAt')
        .skip(skip)
        .limit(limitNum)
        .populate('author', 'name email'),
      Blog.countDocuments(query)
    ]);

    return ApiResponse.success(res, 'Blogs retrieved successfully', {
      blogs,
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

// @desc    Get admin blogs (All blogs - only for admin)
// @route   GET /api/blog/admin/all
// @access  Private/Admin
exports.getAdminBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, published } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (published !== undefined) {
      query.published = published === 'true';
    }

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .populate('author', 'name email'),
      Blog.countDocuments(query)
    ]);

    return ApiResponse.success(res, 'Blogs retrieved successfully', {
      blogs,
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

// @desc    Get single blog by slug
// @route   GET /api/blog/:slug
// @access  Public
exports.getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true })
      .populate('author', 'name email');

    if (!blog) {
      return ApiResponse.error(res, 'Blog post not found', 404);
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    return ApiResponse.success(res, 'Blog post retrieved successfully', blog);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single blog by ID (Admin - all posts)
// @route   GET /api/blog/admin/:id
// @access  Private/Admin
exports.getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name email');

    if (!blog) {
      return ApiResponse.error(res, 'Blog post not found', 404);
    }

    return ApiResponse.success(res, 'Blog post retrieved successfully', blog);
  } catch (error) {
    next(error);
  }
};

// @desc    Update blog post (Admin only)
// @route   PUT /api/blog/:id
// @access  Private/Admin
exports.updateBlog = async (req, res, next) => {
  try {
    const { title, content, excerpt, category, tags, featuredImage, published } = req.body;

    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return ApiResponse.error(res, 'Blog post not found', 404);
    }

    // Update fields if provided
    if (title) blog.title = title;
    if (content) blog.content = content;
    if (excerpt !== undefined) blog.excerpt = excerpt;
    if (category) blog.category = category;
    if (tags) blog.tags = tags;
    if (featuredImage) blog.featuredImage = featuredImage;
    
    // Handle publish state change
    if (published !== undefined && published !== blog.published) {
      blog.published = published;
      if (published) {
        blog.publishedAt = new Date();
      }
    }

    blog = await blog.save();
    await blog.populate('author', 'name email');

    return ApiResponse.success(res, 'Blog post updated successfully', blog);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete blog post (Admin only)
// @route   DELETE /api/blog/:id
// @access  Private/Admin
exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return ApiResponse.error(res, 'Blog post not found', 404);
    }

    return ApiResponse.success(res, 'Blog post deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to blog
// @route   POST /api/blog/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const userId = req.userId;

    if (!comment || comment.trim().length === 0) {
      return ApiResponse.error(res, 'Comment cannot be empty', 400);
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return ApiResponse.error(res, 'Blog post not found', 404);
    }

    blog.comments.push({
      user: userId,
      comment: comment.trim()
    });

    await blog.save();
    await blog.populate('comments.user', 'name email');

    return ApiResponse.success(res, 'Comment added successfully', blog.comments);
  } catch (error) {
    next(error);
  }
};

// @desc    Like blog post
// @route   POST /api/blog/:id/like
// @access  Public
exports.likeBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return ApiResponse.error(res, 'Blog post not found', 404);
    }

    blog.likes += 1;
    await blog.save();

    return ApiResponse.success(res, 'Blog post liked successfully', { likes: blog.likes });
  } catch (error) {
    next(error);
  }
};

// @desc    Get blog categories
// @route   GET /api/blog/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = ['news', 'tips', 'reviews', 'featured', 'other'];
    return ApiResponse.success(res, 'Categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};
