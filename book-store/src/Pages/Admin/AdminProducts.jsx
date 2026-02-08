import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiSearch, HiFilter, HiEye, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import CloudinaryUpload from '../../components/CloudinaryUpload';
import { bookAPI, categoryAPI } from '../../services/api';

const AdminProducts = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    shippingCost: 0,
    discount: 0,
    category: 'Fiction',
    stock: '',
    isbn: '',
    publisher: '',
    publishDate: '',
    pages: '',
    language: 'English',
    images: [],  // Changed to array for multiple images
    image: '' // Keep for backward compatibility
  });

  // Default categories (will be replaced by API categories)
  const defaultCategories = [
    { _id: 'temp-1', name: 'Fiction' },
    { _id: 'temp-2', name: 'Non-Fiction' },
    { _id: 'temp-3', name: 'Biography' },
    { _id: 'temp-4', name: 'Self-Help' },
    { _id: 'temp-5', name: 'Science' }
  ];

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAllCategories();
        setCategories(response.data || defaultCategories);
      } catch (error) {
        console.log('Using default categories:', error.message);
        setCategories(defaultCategories);
      }
    };

    fetchCategories();
  }, []);

  // Fetch books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await bookAPI.getAllBooks({ 
          page, 
          limit: 10,
          search: searchQuery 
        });
        setBooks(response.data?.books || []);
        setTotalPages(response.data?.pagination?.pages || 1);
      } catch (error) {
        toast.error('Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [page, searchQuery]);

  const handleAddBook = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      description: '',
      price: '',
      shippingCost: 0,
      discount: 0,
      category: 'Fiction',
      stock: '',
      isbn: '',
      publisher: '',
      publishDate: '',
      pages: '',
      language: 'English',
      images: [],
      image: ''
    });
    setShowModal(true);
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setFormData({
      ...book,
      images: book.images || (book.image ? [{ url: book.image }] : [])
    });
    setShowModal(true);
  };

  const handleImagesUpload = (uploadedImages) => {
    // Handle both single and multiple uploads
    if (Array.isArray(uploadedImages)) {
      setFormData(prev => ({
        ...prev,
        images: uploadedImages,
        image: uploadedImages[0]?.url || '' // Set first as main image
      }));
    } else if (uploadedImages) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, uploadedImages],
        image: prev.image || uploadedImages.url
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        // Ensure we send images in the correct format
        images: formData.images.map(img => typeof img === 'string' ? img : img.url),
        image: formData.images.length > 0 
          ? (typeof formData.images[0] === 'string' ? formData.images[0] : formData.images[0].url)
          : formData.image
      };

      if (editingBook) {
        await bookAPI.updateBook(editingBook._id, submitData);
        toast.success('Book updated successfully');
      } else {
        await bookAPI.createBook(submitData);
        toast.success('Book created successfully');
      }
      setShowModal(false);
      // Refresh books list
      const response = await bookAPI.getAllBooks({ page, limit: 10 });
      setBooks(response.data?.books || []);
    } catch (error) {
      toast.error(error.message || 'Failed to save book');
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await bookAPI.deleteBook(bookId);
        toast.success('Book deleted successfully');
        setBooks(books.filter(b => b._id !== bookId));
      } catch (error) {
        toast.error('Failed to delete book');
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
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
                    Manage Books
                  </h1>
                  <p className="text-gray-600">Manage your book inventory</p>
                </div>
                <motion.button
                  onClick={handleAddBook}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-semibold transition-all"
                >
                  <HiPlus className="w-5 h-5" />
                  Add New Book
                </motion.button>
              </div>
            </motion.div>

            {/* Search & Filter */}
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
                  placeholder="Search books by title, author..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-gray-100/50 border border-gray-300/50 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200/50 border border-gray-300/50 rounded-lg text-gray-700 hover:text-gray-900 transition-all"
              >
                <HiFilter className="w-5 h-5" />
                Filter
              </motion.button>
            </motion.div>

            {/* Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-gray-200/50 rounded-xl overflow-hidden shadow-lg"
            >
              {loading ? (
                <div className="p-8 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto"
                  />
                </div>
              ) : books.length === 0 ? (
                <div className="p-8 text-center text-gray-600">
                  No books found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-300/50 bg-gray-100/30">
                        <th className="px-6 py-4 text-left text-sm text-gray-700 font-medium">Title</th>
                        <th className="px-6 py-4 text-left text-sm text-gray-700 font-medium">Author</th>
                        <th className="px-6 py-4 text-left text-sm text-gray-700 font-medium">Price</th>
                        <th className="px-6 py-4 text-left text-sm text-gray-700 font-medium">Stock</th>
                        <th className="px-6 py-4 text-left text-sm text-gray-700 font-medium">Category</th>
                        <th className="px-6 py-4 text-center text-sm text-gray-700 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.map((book) => (
                        <motion.tr
                          key={book._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-gray-300/30 hover:bg-gray-100/30 transition-all"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {book.image && (
                                <img src={book.image} alt={book.title} className="w-10 h-14 object-cover rounded" />
                              )}
                              <div>
                                <p className="text-dark font-medium">{book.title}</p>
                                <p className="text-xs text-gray-500">ID: {book._id.slice(0, 8)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-700">{book.author}</td>
                          <td className="px-6 py-4 text-cyan-400 font-semibold">₦{book.price?.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              book.stock > 10 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {book.stock} units
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-700">{book.category}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleEditBook(book)}
                                className="p-2 hover:bg-blue-500/20 rounded transition-colors text-blue-400"
                              >
                                <HiPencil className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDeleteBook(book._id)}
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
                        : 'bg-gray-200/50 text-gray-700 border border-gray-300/50 hover:border-cyan-500/50'
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
            className="bg-white border border-gray-200 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white/95">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </h2>
              <motion.button
                onClick={() => setShowModal(false)}
                whileHover={{ scale: 1.1 }}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <HiX className="w-6 h-6 text-gray-700" />
              </motion.button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                {/* Shipping Cost */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Cost (₦)</label>
                  <input
                    type="number"
                    value={formData.shippingCost}
                    onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                    placeholder="Leave blank for free shipping"
                    min="0"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                {/* Discount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-cyan-500/50"
                  >
                    {categories.length > 0 ? (
                      categories.map(cat => (
                        <option key={cat._id || cat} value={cat.name || cat} className="bg-white text-gray-900">
                          {cat.name || cat}
                        </option>
                      ))
                    ) : (
                      <>
                        <option className="bg-white text-gray-900">Fiction</option>
                        <option className="bg-white text-gray-900">Non-Fiction</option>
                        <option className="bg-white text-gray-900">Science</option>
                        <option className="bg-white text-gray-900">Technology</option>
                        <option className="bg-white text-gray-900">Business</option>
                        <option className="bg-white text-gray-900">Biography</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>

              {/* Book Images Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Book Images</label>
                <CloudinaryUpload
                  onUpload={handleImagesUpload}
                  multiple={true}
                  folder="books"
                  className="mb-4"
                >
                  Upload book cover and preview images
                </CloudinaryUpload>
                
                {/* Display uploaded images */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-gray-800/30 rounded-lg">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={typeof img === 'string' ? img : img.url}
                          alt={`Book ${idx}`}
                          className="w-full h-24 object-cover rounded border border-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== idx)
                            }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <HiX className="w-4 h-4" />
                        </button>
                        {idx === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-cyan-500/50 text-xs text-white px-2 py-1 rounded-b">
                            Main Image
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ISBN */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">ISBN</label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                />
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
                  {editingBook ? 'Update Book' : 'Create Book'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
