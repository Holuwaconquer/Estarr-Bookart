import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiSearch, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import AdminSubmitButton from '../../components/AdminSubmitButton';
import { categoryAPI } from '../../services/api';

const AdminCategories = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
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
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      setSaving(true);

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
    } finally {
      setSaving(false);
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
    <div className="admin-page flex h-screen overflow-hidden bg-[#f7f5f2] text-[#28202f]">
      {/* Sidebar */}
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-700">Catalog architecture</p>
              <h1 className="font-serif text-3xl font-semibold text-[#28202f] sm:text-4xl">
                Categories
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[#7b7180] sm:text-base">
                Organize your shelves and make it easier for readers to find their next book.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddCategory}
              className="admin-primary-action inline-flex items-center justify-center gap-2 rounded-xl bg-[#5b21b6] px-5 py-3 font-semibold text-white! shadow-sm transition-all duration-300 hover:shadow-lg"
            >
              <HiPlus className="w-5 h-5" />
              Add Category
            </motion.button>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Total shelves', value: categories.length, detail: 'Across the collection' },
              { label: 'Active', value: categories.filter((category) => category.isActive !== false).length, detail: 'Visible to readers' },
              { label: 'Inactive', value: categories.filter((category) => category.isActive === false).length, detail: 'Hidden from the shop' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-black/[0.06] bg-white px-5 py-4 shadow-[0_4px_18px_rgba(30,27,41,0.035)]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b8190]">{stat.label}</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <span className="font-serif text-3xl font-semibold text-[#332344]">{stat.value}</span>
                  <span className="pb-1 text-xs text-[#8b8190]">{stat.detail}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-black/[0.06] bg-white p-3 shadow-[0_4px_18px_rgba(30,27,41,0.035)] sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <HiSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#928899]" />
              <input
                type="text"
                placeholder="Find a category by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-transparent bg-[#f7f5f8] py-3 pl-12 pr-4 text-sm text-[#30243a] placeholder:text-[#a29aa8] focus:border-violet-300 focus:bg-white focus:outline-none"
              />
            </div>
            <span className="px-2 text-sm text-[#857b8b]">
              {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
            </span>
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="rounded-2xl border border-black/[0.06] bg-white py-16 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent"></div>
            </div>
          ) : filteredCategories.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
            >
              {filteredCategories.map((category, idx) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_5px_22px_rgba(30,27,41,0.045)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(30,27,41,0.1)]"
                >
                  <div className={`relative h-28 bg-gradient-to-r ${category.color || 'from-violet-600 to-fuchsia-500'}`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.35),transparent_35%)]" />
                    <div className="absolute -bottom-7 left-5 flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-white text-3xl shadow-md">
                      {category.icon || '📚'}
                    </div>
                    <span className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold ${
                      category.isActive !== false
                        ? 'bg-white/90 text-emerald-700'
                        : 'bg-black/20 text-white'
                    }`}>
                      {category.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                    <span className="absolute bottom-3 right-4 rounded-full bg-black/15 px-3 py-1 text-xs font-semibold text-white">
                      Shelf {category.order ?? 0}
                    </span>
                  </div>

                  <div className="p-5 pt-10">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-xl font-semibold text-[#30243a]">{category.name}</h3>
                        <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-[#988e9d]">
                          Collection category
                        </p>
                      </div>
                    </div>

                    <p className="mb-5 min-h-10 text-sm leading-relaxed text-[#786e80] line-clamp-2">
                      {category.description || 'No description added yet.'}
                    </p>

                    <div className="flex gap-2 border-t border-black/[0.06] pt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditCategory(category)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-50 px-3 py-2.5 text-sm font-semibold text-violet-800 transition-colors hover:bg-violet-100"
                      >
                        <HiPencil className="h-4 w-4" />
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteCategory(category._id)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                      >
                        <HiTrash className="h-4 w-4" />
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#d8d0dd] bg-white py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-2xl">📚</div>
              <p className="mt-4 font-semibold text-[#30243a]">
                {searchQuery ? 'No matching shelves' : 'Your category shelves are empty'}
              </p>
              <p className="mt-1 text-sm text-[#857b8b]">
                {searchQuery ? 'Try a different search term.' : 'Add your first category to organize the catalog.'}
              </p>
              {!searchQuery && (
                <button onClick={handleAddCategory} className="mt-5 rounded-xl bg-[#5b21b6] px-4 py-2.5 text-sm font-semibold text-white">
                  Add your first category
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1326]/55 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/70 bg-white p-5 shadow-2xl sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">
                  {editingCategory ? 'Update collection' : 'Build your catalog'}
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[#30243a]">
                  {editingCategory ? 'Edit category' : 'Add a category'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                type="button"
                aria-label="Close category editor"
                className="rounded-xl p-2 text-[#817687] transition-colors hover:bg-[#f4f0f7] hover:text-[#30243a]"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#51465d]">Category name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Fiction"
                  className="w-full rounded-xl border border-[#e3dce8] bg-[#fcfbfd] px-4 py-3 text-[#30243a] placeholder:text-[#a29aa8] focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-100"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#51465d]">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this category"
                  rows="3"
                  className="w-full resize-none rounded-xl border border-[#e3dce8] bg-[#fcfbfd] px-4 py-3 text-[#30243a] placeholder:text-[#a29aa8] focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#51465d]">Category icon</label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      aria-label={`Use ${icon} category icon`}
                      aria-pressed={formData.icon === icon}
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl transition-colors ${
                        formData.icon === icon
                          ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-100'
                          : 'border-[#e8e2ec] bg-white hover:border-violet-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#51465d]">Shelf color</label>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Select ${color.replace('from-', '').replace(' to-', ' to ')} color`}
                      aria-pressed={formData.color === color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`h-9 rounded-lg bg-gradient-to-r ${color} transition-transform ${
                        formData.color === color ? 'ring-2 ring-violet-700 ring-offset-2' : 'hover:scale-[1.03]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#51465d]">Display order</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#e3dce8] bg-[#fcfbfd] px-4 py-3 text-[#30243a] focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-100"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#51465d]">Visibility</label>
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                    className="w-full rounded-xl border border-[#e3dce8] bg-[#fcfbfd] px-4 py-3 text-[#30243a] focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-100"
                  >
                    <option value="active">Active - visible in shop</option>
                    <option value="inactive">Inactive - hidden in shop</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-black/[0.06] pt-5 sm:flex-row">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-[#ded6e4] px-6 py-3 font-semibold text-[#5e5368] transition-colors hover:bg-[#f8f6fa]"
                >
                  Cancel
                </motion.button>
                <AdminSubmitButton
                  type="submit"
                  loading={saving}
                  className="flex-1 rounded-xl bg-[#5b21b6] px-6 py-3 font-semibold text-white hover:shadow-lg"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </AdminSubmitButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
