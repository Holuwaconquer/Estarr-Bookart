import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiSearch, HiFilter, HiEye, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import CloudinaryUpload from '../../components/CloudinaryUpload';
import { blogAPI } from '../../services/api';

const AdminBlog = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [publishFilter, setPublishFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'technology',
    tags: [],
    featuredImage: '',
    image: '',
    published: false
  });
  const [tagInput, setTagInput] = useState('');

  const categories = ['technology', 'business', 'lifestyle', 'news', 'tutorial', 'review', 'other'];

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await blogAPI.getAdminBlogs({ 
          page,
          limit: 10,
          published: publishFilter ? publishFilter === 'true' : undefined
        });
        setBlogs(response.data?.blogs || []);
        setTotalPages(response.data?.pagination?.pages || 1);
      } catch (error) {
        toast.error('Failed to fetch blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [page, publishFilter]);

  const handleAddBlog = () => {
    setEditingBlog(null);
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: 'technology',
      tags: [],
      featuredImage: '',
      image: '',
      published: false
    });
    setTagInput('');
    setShowModal(true);
  };

  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setFormData(blog);
    setTagInput(blog.tags?.join(', ') || '');
    setShowModal(true);
  };

  const handleAddTag = (tag) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData({ ...formData, tags: [...formData.tags, trimmed] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tagToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBlog) {
        await blogAPI.updateBlog(editingBlog._id, formData);
        toast.success('Blog updated successfully');
      } else {
        await blogAPI.createBlog(formData);
        toast.success('Blog created successfully');
      }
      setShowModal(false);
      // Refresh blogs
      const response = await blogAPI.getAdminBlogs({ page, limit: 10 });
      setBlogs(response.data?.blogs || []);
    } catch (error) {
      toast.error(error.message || 'Failed to save blog');
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await blogAPI.deleteBlog(blogId);
        toast.success('Blog deleted successfully');
        setBlogs(blogs.filter(b => b._id !== blogId));
      } catch (error) {
        toast.error('Failed to delete blog');
      }
    }
  };

  const handlePublishToggle = async (blog) => {
    try {
      await blogAPI.updateBlog(blog._id, { ...blog, published: !blog.published });
      toast.success(blog.published ? 'Blog unpublished' : 'Blog published');
      setBlogs(blogs.map(b => b._id === blog._id ? { ...b, published: !b.published } : b));
    } catch (error) {
      toast.error('Failed to update blog');
    }
  };

  return (
    <div className="flex h-screen bg-gray-950">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-950 via-blue-950 to-indigo-950">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Blog Management
                  </h1>
                  <p className="text-gray-400">Create and manage blog posts</p>
                </div>
                <motion.button
                  onClick={handleAddBlog}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-semibold transition-all"
                >
                  <HiPlus className="w-5 h-5" />
                  New Post
                </motion.button>
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 flex flex-col sm:flex-row gap-4"
            >
              <div className="flex-1 relative">
                <HiSearch className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-800/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <select
                value={publishFilter}
                onChange={(e) => {
                  setPublishFilter(e.target.value);
                  setPage(1);
                }}
                className="px-6 py-3 bg-gray-900/50 border border-gray-800/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
              >
                <option value="">All Posts</option>
                <option value="true">Published</option>
                <option value="false">Drafts</option>
              </select>
            </motion.div>

            {/* Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-800/50 rounded-xl overflow-hidden shadow-lg"
            >
              {loading ? (
                <div className="p-8 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto"
                  />
                </div>
              ) : blogs.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  No blog posts found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700/50 bg-gray-900/50">
                        <th className="px-6 py-4 text-left text-sm text-gray-400 font-medium">Title</th>
                        <th className="px-6 py-4 text-left text-sm text-gray-400 font-medium">Category</th>
                        <th className="px-6 py-4 text-left text-sm text-gray-400 font-medium">Author</th>
                        <th className="px-6 py-4 text-left text-sm text-gray-400 font-medium">Status</th>
                        <th className="px-6 py-4 text-left text-sm text-gray-400 font-medium">Views</th>
                        <th className="px-6 py-4 text-center text-sm text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogs.map((blog) => (
                        <motion.tr
                          key={blog._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-all"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {blog.featuredImage && (
                                <img src={blog.featuredImage} alt={blog.title} className="w-10 h-10 object-cover rounded" />
                              )}
                              <div>
                                <p className="text-white font-medium">{blog.title}</p>
                                <p className="text-xs text-gray-500">{blog.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-400 border border-purple-500/30">
                              {blog.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            <p>{blog.author?.name}</p>
                            <p className="text-xs text-gray-500">{blog.author?.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                              blog.published 
                                ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            }`}>
                              {blog.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            {blog.views || 0}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handlePublishToggle(blog)}
                                className="p-2 hover:bg-blue-500/20 rounded transition-colors text-blue-400"
                              >
                                <HiEye className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleEditBlog(blog)}
                                className="p-2 hover:bg-cyan-500/20 rounded transition-colors text-cyan-400"
                              >
                                <HiPencil className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDeleteBlog(blog._id)}
                                className="p-2 hover:bg-red-500/20 rounded transition-colors text-red-400"
                              >
                                <HiTrash className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <motion.button
                    key={p}
                    onClick={() => setPage(p)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      page === p
                        ? 'bg-cyan-500/50 text-white border border-cyan-500'
                        : 'bg-gray-900/50 text-gray-400 border border-gray-800/50 hover:border-cyan-500/50'
                    }`}
                  >
                    {p}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-900 border border-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/95">
              <h2 className="text-2xl font-bold text-white">
                {editingBlog ? 'Edit Post' : 'Create New Post'}
              </h2>
              <motion.button
                onClick={() => setShowModal(false)}
                whileHover={{ scale: 1.1 }}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <HiX className="w-6 h-6 text-gray-400" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Category & Featured Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="capitalize">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Featured Image Upload (Cloudinary) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Featured Image (via Cloudinary)</label>
                <CloudinaryUpload
                  onUpload={(image) => {
                    const imageUrl = typeof image === 'string' ? image : image.url;
                    setFormData({ 
                      ...formData, 
                      featuredImage: imageUrl,
                      image: imageUrl
                    });
                  }}
                  multiple={false}
                  folder="blog"
                >
                  Upload featured image
                </CloudinaryUpload>
                
                {/* Image Preview */}
                {(formData.featuredImage || formData.image) && (
                  <div className="mt-4 relative">
                    <img
                      src={formData.featuredImage || formData.image}
                      alt="Featured"
                      className="w-full h-48 object-cover rounded-lg border border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, featuredImage: '', image: '' })}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows="8"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 resize-none font-mono text-sm"
                  placeholder="Write your blog content here..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(tagInput);
                        }
                      }}
                      placeholder="Add tags (press Enter)..."
                      className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                    />
                    <motion.button
                      type="button"
                      onClick={() => handleAddTag(tagInput)}
                      whileHover={{ scale: 1.05 }}
                      className="px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg font-medium hover:bg-cyan-500/30"
                    >
                      Add
                    </motion.button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <motion.div
                        key={tag}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-purple-300"
                        >
                          ×
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Publish */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-700/50 accent-cyan-500"
                />
                <label htmlFor="published" className="text-gray-300 font-medium">
                  Publish immediately
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end">
                <motion.button
                  onClick={() => setShowModal(false)}
                  whileHover={{ scale: 1.05 }}
                  type="button"
                  className="px-6 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold transition-all"
                >
                  {editingBlog ? 'Update Post' : 'Create Post'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminBlog;
