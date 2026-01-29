import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiEye,
  HiEyeOff,
  HiSearchCircle,
  HiFilter,
  HiStar,
  HiCalendar
} from 'react-icons/hi';
import DashboardLayout from '../../layouts/DashboardLayouts';
import toast from 'react-hot-toast';

const AdminBlogDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    image: '',
    featured: false,
    published: true
  });

  useEffect(() => {
    // Mock data - replace with API calls
    const mockPosts = [
      {
        _id: '1',
        title: 'The Magic of Reading',
        excerpt: 'Discover how reading transforms your mind and soul.',
        content: 'Full content here...',
        category: 'reading-tips',
        image: 'https://via.placeholder.com/300x200',
        author: 'Admin',
        featured: true,
        published: true,
        views: 1234,
        createdAt: new Date('2024-01-15')
      },
      {
        _id: '2',
        title: 'Top 10 Books of 2024',
        excerpt: 'Our curated list of must-read books this year.',
        content: 'Full content here...',
        category: 'recommendations',
        image: 'https://via.placeholder.com/300x200',
        author: 'Admin',
        featured: false,
        published: true,
        views: 892,
        createdAt: new Date('2024-01-10')
      }
    ];
    
    const mockCategories = [
      { _id: '1', name: 'Reading Tips' },
      { _id: '2', name: 'Recommendations' },
      { _id: '3', name: 'Author Interviews' },
      { _id: '4', name: 'Book Reviews' }
    ];

    setPosts(mockPosts);
    setCategories(mockCategories);
    setLoading(false);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      if (editingPost) {
        // Update post
        const updatedPost = {
          ...editingPost,
          ...formData,
          updatedAt: new Date()
        };
        setPosts(posts.map(p => p._id === editingPost._id ? updatedPost : p));
        toast.success('Blog post updated successfully');
      } else {
        // Create new post
        const newPost = {
          _id: Date.now().toString(),
          ...formData,
          author: 'Admin',
          views: 0,
          createdAt: new Date()
        };
        setPosts([newPost, ...posts]);
        toast.success('Blog post created successfully');
      }

      setShowForm(false);
      setEditingPost(null);
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        category: '',
        image: '',
        featured: false,
        published: true
      });
    } catch (error) {
      toast.error('Failed to save blog post');
      console.error(error);
    }
  };

  const handleDelete = (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setPosts(posts.filter(p => p._id !== postId));
      toast.success('Blog post deleted successfully');
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      image: post.image,
      featured: post.featured,
      published: post.published
    });
    setShowForm(true);
  };

  const handleToggleFeatured = (postId) => {
    setPosts(posts.map(p => 
      p._id === postId ? { ...p, featured: !p.featured } : p
    ));
    toast.success('Featured status updated');
  };

  const handleTogglePublished = (postId) => {
    setPosts(posts.map(p => 
      p._id === postId ? { ...p, published: !p.published } : p
    ));
    toast.success('Published status updated');
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = [
    { label: 'Total Posts', value: posts.length, color: 'purple' },
    { label: 'Published', value: posts.filter(p => p.published).length, color: 'green' },
    { label: 'Featured', value: posts.filter(p => p.featured).length, color: 'yellow' },
    { label: 'Total Views', value: posts.reduce((sum, p) => sum + (p.views || 0), 0), color: 'blue' }
  ];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Management</h1>
            <p className="text-gray-600">Create and manage your blog posts</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowForm(true);
              setEditingPost(null);
              setFormData({
                title: '',
                content: '',
                excerpt: '',
                category: '',
                image: '',
                featured: false,
                published: true
              });
            }}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700"
          >
            <HiPlus className="w-5 h-5" />
            New Post
          </motion.button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${stat.color}-500`}
            >
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <HiSearchCircle className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search blog posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div className="flex gap-2">
              <HiFilter className="w-5 h-5 text-gray-400 self-center" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Posts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-gray-600 mt-4">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow-md p-12 text-center"
          >
            <HiSearchCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">No blog posts found</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              Create First Post
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all"
                >
                  {/* Image */}
                  {post.image && (
                    <div className="relative h-40 overflow-hidden bg-gray-200">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                      {post.featured && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          <HiStar className="w-4 h-4" />
                          Featured
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2">{post.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.excerpt}</p>

                    {/* Meta */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <HiCalendar className="w-4 h-4" />
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      {post.views !== undefined && (
                        <>
                          <span>•</span>
                          <span>{post.views} views</span>
                        </>
                      )}
                    </div>

                    {/* Status Badges */}
                    <div className="flex gap-2 mb-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        post.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                      {post.category && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          {categories.find(c => c._id === post.category)?.name}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleFeatured(post._id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 font-medium text-sm transition-all"
                      >
                        <HiStar className="w-4 h-4" />
                        {post.featured ? 'Unstar' : 'Star'}
                      </button>
                      <button
                        onClick={() => handleTogglePublished(post._id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium text-sm transition-all"
                      >
                        {post.published ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                        {post.published ? 'Hide' : 'Show'}
                      </button>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEdit(post)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm"
                      >
                        <HiPencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium text-sm"
                      >
                        <HiTrash className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Blog Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-2xl w-full max-w-2xl my-8"
            >
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingPost ? 'Edit Post' : 'New Blog Post'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="Post title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="Short summary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="Full post content"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="published"
                      checked={formData.published}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">Published</span>
                  </label>
                </div>
              </form>

              <div className="p-6 border-t bg-gray-50 flex gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                  {editingPost ? 'Update Post' : 'Create Post'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default AdminBlogDashboard;
