import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiSearch, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { categoryAPI } from '../../services/api';

const AdminCategories = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📚',
    color: 'from-blue-500 to-cyan-500',
    order: 0,
    isActive: true
  });

  const colorOptions = [
    'from-blue-500 to-cyan-500',
    'from-red-500 to-orange-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-emerald-500',
    'from-yellow-500 to-amber-500',
    'from-indigo-600 to-purple-600',
    'from-pink-500 to-rose-500',
    'from-teal-500 to-cyan-500',
  ];

  const iconOptions = ['📚', '📖', '💕', '🔍', '🔬', '📜', '👤', '🌟', '✍️', '🎨', '🆕', '🔥', '🏆', '🎯'];

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryAPI.getAdminCategories();
        setCategories(response.data || []);
      } catch (error) {
        toast.error('Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: '📚',
      color: 'from-blue-500 to-cyan-500',
      order: 0,
      isActive: true
    });
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '📚',
      color: category.color || 'from-blue-500 to-cyan-500',
      order: category.order || 0,
      isActive: category.isActive !== false
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name.trim()) {
        toast.error('Category name is required');
        return;
      }

      if (editingCategory) {
        await categoryAPI.updateCategory(editingCategory._id, formData);
        toast.success('Category updated successfully');
      } else {
        await categoryAPI.createCategory(formData);
        toast.success('Category created successfully');
      }

      setShowModal(false);
      // Refresh categories
      const response = await categoryAPI.getAdminCategories();
      setCategories(response.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryAPI.deleteCategory(categoryId);
        toast.success('Category deleted successfully');
        setCategories(categories.filter(c => c._id !== categoryId));
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Manage Categories
              </h1>
              <p className="text-gray-400 mt-2">Create and manage book categories</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddCategory}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
            >
              <HiPlus className="w-5 h-5" />
              Add Category
            </motion.button>
          </div>

          {/* Search Bar */}
          <div className="mb-8 flex gap-4">
            <div className="flex-1 relative">
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredCategories.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredCategories.map((category, idx) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-cyan-500/50 transition-all duration-300 group"
                >
                  {/* Category Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`text-4xl p-3 rounded-lg bg-gradient-to-r ${category.color} bg-opacity-10`}>
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                        <p className="text-sm text-gray-400">Order: {category.order}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      category.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-600/20 text-gray-400'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  {/* Description */}
                  {category.description && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  {/* Color Preview */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`h-6 w-full rounded bg-gradient-to-r ${category.color}`}></div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEditCategory(category)}
                      className="flex-1 flex items-center justify-center gap-2 bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 px-3 py-2 rounded-lg transition-all duration-300"
                    >
                      <HiPencil className="w-4 h-4" />
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteCategory(category._id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 px-3 py-2 rounded-lg transition-all duration-300"
                    >
                      <HiTrash className="w-4 h-4" />
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No categories found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full p-8 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Fiction"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this category"
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Icon</label>
                <div className="grid grid-cols-7 gap-2">
                  {iconOptions.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`p-3 text-2xl rounded-lg border-2 transition-all duration-300 ${
                        formData.icon === icon
                          ? 'border-cyan-500 bg-cyan-600/20'
                          : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                <div className="grid grid-cols-4 gap-3">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        formData.color === color
                          ? 'border-white scale-105'
                          : 'border-gray-600'
                      }`}
                    >
                      <div className={`h-8 rounded bg-gradient-to-r ${color}`}></div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Active Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-2 border border-gray-600 text-white rounded-lg hover:border-gray-500 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="flex-1 px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
                >
                  {editingCategory ? 'Update' : 'Create'} Category
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
