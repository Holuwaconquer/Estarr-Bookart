import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { bookAPI, categoryAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSearch, HiX, HiArrowUp, HiArrowDown } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesRes = await categoryAPI.getAllCategories();
        setCategories(categoriesRes.data || []);

        // Fetch books with filters
        const params = {
          search: searchQuery,
          category: selectedCategory,
          sort: sortBy,
          minPrice: priceRange[0],
          maxPrice: priceRange[1]
        };
        
        // Call getAllBooks with the assembled params so `search` and `category` are passed as query params
        const booksRes = await bookAPI.getAllBooks(params);
        // API returns { data: { books, pagination } } or { data: books }
        const booksData = booksRes.data?.books || booksRes.data || [];
        setBooks(booksData || []);
      } catch (error) {
        toast.error('Failed to load books');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, selectedCategory, sortBy, priceRange]);

  // Sync local state when URL search params change (handles navigation from Navbar/Landingpage)
  useEffect(() => {
    const q = searchParams.get('q') || searchParams.get('search') || '';
    const cat = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'newest';

    // Only update if different to avoid infinite loops
    if (q !== searchQuery) setSearchQuery(q);
    if (cat !== selectedCategory) setSelectedCategory(cat);
    if (sort !== sortBy) setSortBy(sort);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q: searchQuery });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('newest');
    setPriceRange([0, 100000]);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Books</h1>
          <p className="text-xl text-gray-600">Browse our collection of thousands of books</p>
        </motion.div>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSearch}
          className="mb-8"
        >
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, or keyword..."
              className="w-full px-6 py-4 pr-14 rounded-lg border-2 border-gray-200 focus:border-purple-600 focus:outline-none text-lg transition-all"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600"
            >
              <HiSearch className="w-6 h-6" />
            </button>
          </div>
        </motion.form>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:block ${showFilters ? 'block' : 'hidden'}`}
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`block w-full text-left px-4 py-2 rounded-lg transition-all ${
                      selectedCategory === ''
                        ? 'bg-purple-100 text-purple-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => setSelectedCategory(cat._id)}
                      className={`block w-full text-left px-4 py-2 rounded-lg transition-all ${
                        selectedCategory === cat._id
                          ? 'bg-purple-100 text-purple-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Min: NGN {priceRange[0].toLocaleString()}</label>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Max: NGN {priceRange[1].toLocaleString()}</label>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="newest">Newest</option>
                  <option value="popularity">Most Popular</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Books Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
                </div>
              </div>
            ) : books.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence>
                  {books.map((book, idx) => (
                    <motion.div
                      key={book._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -8 }}
                      onClick={() => navigate(`/product/${book._id}`)}
                      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer group"
                    >
                      <div className="relative h-64 bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden">
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-6xl">📚</div>
                        )}
                        {book.discount && (
                          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                            -{book.discount}%
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 line-clamp-2 mb-2">{book.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{book.author?.name || 'Unknown'}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm text-gray-600">{book.rating?.toFixed(1) || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-purple-600">
                            NGN {book.price?.toLocaleString()}
                          </span>
                          <button className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                            View
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-gray-600 mb-4">No books found matching your criteria</p>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
