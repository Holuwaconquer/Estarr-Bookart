import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { HiFire, HiPlus, HiTrash, HiPencil, HiX, HiCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { AuthContext } from '../../AuthContext';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';

const AdminFlashSalesManagement = () => {
  const { user, token: contextToken } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [flashSalesProducts, setFlashSalesProducts] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    bookId: '',
    discountPercentage: 10,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 1
  });

  const API_URL = import.meta.env.VITE_API_URL;

  // Get token from multiple sources
  const getToken = () => {
    const sources = [
      contextToken,
      localStorage.getItem('token'),
      localStorage.getItem('accessToken'),
      sessionStorage.getItem('token'),
      sessionStorage.getItem('accessToken')
    ];
    
    const token = sources.find(t => t && t !== 'undefined' && t !== 'null');
    
    if (token) {
      console.log('✅ Token found from:', contextToken ? 'AuthContext' : 'localStorage/sessionStorage');
      console.log('🔑 Token preview:', token.substring(0, 20) + '...');
    } else {
      console.warn('❌ No valid token found in any source');
      console.log('Context token:', !!contextToken);
      console.log('localStorage.token:', !!localStorage.getItem('token'));
      console.log('localStorage.accessToken:', !!localStorage.getItem('accessToken'));
    }
    
    return token;
  };

  // Get auth headers
  const getAuthHeaders = () => {
    const token = getToken();
    if (!token) {
      console.warn('⚠️ No token available');
      return {
        'Content-Type': 'application/json'
      };
    }
    console.log('🔐 Auth header prepared with token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch all books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/books?limit=100`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.data?.books) {
          setAllBooks(result.data.books);
        }
      } catch (error) {
        console.error('Error fetching books:', error);
        toast.error('Failed to load books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Fetch flash sales products (those with high discounts)
  const fetchFlashSales = async () => {
    try {
      console.log('📥 Fetching flash sales from:', `${API_URL}/api/books/flash/deals?limit=20`);
      const response = await fetch(`${API_URL}/api/books/flash/deals?limit=20`);
      console.log('📦 Flash sales response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('✅ Flash sales fetched:', result);
      
      if (result.success && result.data) {
        console.log('📊 Flash sales count:', result.data.length);
        setFlashSalesProducts(result.data);
      } else {
        console.warn('⚠️ No flash sales data in response');
        setFlashSalesProducts([]);
      }
    } catch (error) {
      console.error('❌ Error fetching flash sales:', error);
      toast.error('Failed to load flash sales');
    }
  };

  useEffect(() => {
    fetchFlashSales();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!formData.bookId) {
      toast.error('Please select a book');
      return;
    }

    try {
      const selectedBook = allBooks.find(b => b._id === formData.bookId);
      if (!selectedBook) {
        toast.error('Book not found');
        return;
      }

      console.log('🔥 Adding to flash sales:', { 
        bookId: formData.bookId,
        discount: formData.discountPercentage,
        originalPrice: selectedBook.price,
        salePrice: selectedBook.price * (1 - formData.discountPercentage / 100)
      });

      // Update book with discount
      const updateResponse = await fetch(`${API_URL}/api/books/${formData.bookId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          discount: formData.discountPercentage,
          originalPrice: selectedBook.price,
          price: selectedBook.price * (1 - formData.discountPercentage / 100),
          flashSaleStartDate: formData.startDate,
          flashSaleEndDate: formData.endDate
        })
      });

      console.log('Update response status:', updateResponse.status);

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error('❌ Update failed:', errorData);
        throw new Error(errorData.message || 'Failed to update product');
      }

      const updateResult = await updateResponse.json();
      console.log('✅ Product updated:', updateResult);

      toast.success('Product added to flash sales!');
      setShowAddModal(false);
      setFormData({
        bookId: '',
        discountPercentage: 10,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 1
      });
      
      // Refresh flash sales
      await fetchFlashSales();
      
    } catch (error) {
      console.error('❌ Error adding flash sale product:', error);
      toast.error(error.message || 'Error adding product to flash sales');
    }
  };

  const handleRemoveFlashSale = async (bookId) => {
    if (!window.confirm('Are you sure you want to remove this product from flash sales?')) {
      return;
    }

    try {
      const bookToRemove = flashSalesProducts.find(p => p._id === bookId);
      if (!bookToRemove) {
        toast.error('Product not found');
        return;
      }

      console.log('🗑️ Removing flash sale for:', bookId);
      
      const response = await fetch(`${API_URL}/api/books/${bookId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          discount: 0,
          price: bookToRemove.originalPrice || bookToRemove.price
        })
      });

      console.log('Remove response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Failed to remove:', errorData);
        throw new Error(errorData.message || 'Failed to remove from flash sales');
      }

      const result = await response.json();
      console.log('✅ Product removed from flash sales:', result);
      
      toast.success('Removed from flash sales');
      setFlashSalesProducts(prev => prev.filter(p => p._id !== bookId));
    } catch (error) {
      console.error('❌ Error removing flash sale:', error);
      toast.error(error.message || 'Failed to remove from flash sales');
    }
  };

  const handleUpdateDiscount = async (bookId, newDiscount) => {
    if (newDiscount < 1 || newDiscount > 90) {
      toast.error('Discount must be between 1% and 90%');
      return;
    }

    try {
      const book = flashSalesProducts.find(p => p._id === bookId);
      if (!book) {
        toast.error('Book not found');
        return;
      }

      const originalPrice = book.originalPrice || book.price / (1 - (book.discount || 0) / 100);

      const response = await fetch(`${API_URL}/api/books/${bookId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          discount: newDiscount,
          price: originalPrice * (1 - newDiscount / 100)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update discount');
      }

      toast.success('Discount updated!');
      await fetchFlashSales();
      setEditingId(null);
    } catch (error) {
      console.error('Error updating discount:', error);
      toast.error(error.message || 'Failed to update discount');
    }
  };

  const filteredBooks = allBooks.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="animate-pulse flex-1 p-6">
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 md:left-0 md:z-40 md:bg-white md:border-r md:border-gray-200">
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        >
          <motion.div
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            exit={{ x: -100 }}
            className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-40"
            onClick={(e) => e.stopPropagation()}
          >
            <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
          </motion.div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64">
        <AdminHeader isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HiFire className="w-8 h-8 text-orange-500" />
                <h2 className="text-2xl font-bold text-gray-800">Flash Sales Management</h2>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                <HiPlus className="w-5 h-5" />
                Add Product
              </button>
            </div>

            {/* Add Modal */}
            {showAddModal && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white rounded-xl shadow-xl max-w-md w-full"
                >
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800">Add Product to Flash Sales</h3>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <HiX className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleAddProduct} className="p-6 space-y-4">
                    {/* Product Search */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Book
                      </label>
                      <input
                        type="text"
                        placeholder="Search by title or author..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <select
                        value={formData.bookId}
                        onChange={(e) => setFormData({ ...formData, bookId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Choose a book...</option>
                        {filteredBooks.map(book => (
                          <option key={book._id} value={book._id}>
                            {book.title} - ₦{(book.price || 0).toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Discount Percentage */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Percentage: {formData.discountPercentage}%
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="90"
                        value={formData.discountPercentage}
                        onChange={(e) => setFormData({ ...formData, discountPercentage: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <HiCheck className="w-5 h-5" />
                        Add to Flash Sales
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}

            {/* Current Flash Sales */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800">
                  Current Flash Sales ({flashSalesProducts.length})
                </h3>
              </div>

              {flashSalesProducts.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <HiFire className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No flash sales configured yet. Add your first product!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Original Price</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Discount</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Sale Price</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {flashSalesProducts.map(product => (
                        <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-10 h-14 object-cover rounded"
                              />
                              <div>
                                <p className="font-semibold text-gray-800 truncate">{product.title}</p>
                                <p className="text-sm text-gray-500">{product.author}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            ₦{(product.originalPrice || product.price / (1 - (product.discount || 0) / 100)).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            {editingId === product._id ? (
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  max="90"
                                  defaultValue={product.discount}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      const newDiscount = parseInt(e.target.value);
                                      handleUpdateDiscount(product._id, newDiscount);
                                    }
                                  }}
                                  onBlur={(e) => {
                                    const newDiscount = parseInt(e.target.value);
                                    if (!isNaN(newDiscount)) {
                                      handleUpdateDiscount(product._id, newDiscount);
                                    }
                                  }}
                                  className="w-16 px-2 py-1 border border-orange-500 rounded focus:outline-none"
                                  autoFocus
                                />
                                <span>%</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingId(product._id)}
                                className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-2"
                              >
                                <HiPencil className="w-4 h-4" />
                                {product.discount}%
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-700 font-semibold">
                            ₦{(product.price || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleRemoveFlashSale(product._id)}
                              className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-2"
                            >
                              <HiTrash className="w-4 h-4" />
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminFlashSalesManagement;