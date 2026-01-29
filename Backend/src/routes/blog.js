const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', blogController.getAllBlogs);
router.get('/categories', blogController.getCategories);
router.get('/:slug', blogController.getBlogBySlug);
router.post('/:id/like', blogController.likeBlog);
router.post('/:id/comments', protect, blogController.addComment);

// Admin routes
router.post('/', protect, authorize('admin'), blogController.createBlog);
router.get('/admin/all', protect, authorize('admin'), blogController.getAdminBlogs);
router.get('/admin/:id', protect, authorize('admin'), blogController.getBlogById);
router.put('/:id', protect, authorize('admin'), blogController.updateBlog);
router.delete('/:id', protect, authorize('admin'), blogController.deleteBlog);

module.exports = router;
