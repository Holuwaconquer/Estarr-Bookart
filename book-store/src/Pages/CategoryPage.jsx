import React, { useState, useEffect } from 'react';
import { 
  HiFilter, 
  HiViewGrid, 
  HiViewList, 
  HiStar, 
  HiShoppingBag, 
  HiChevronDown,
  HiX,
  HiAdjustments,
  HiFire,
  HiTag,
  HiShieldCheck,
  HiTruck,
  HiSparkles
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import BookCard from '../components/Bookcard.jsx';
import { bookAPI, categoryAPI } from '../services/api';

const CategoryPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  // Fallback categories
  const defaultCategories = [
    { id: 'fiction', name: 'Fiction', count: 142, color: 'from-blue-500 to-cyan-500' },
    { id: 'non-fiction', name: 'Non-Fiction', count: 89, color: 'from-purple-500 to-pink-500' },
    { id: 'limited-edition', name: 'Limited Editions', count: 24, color: 'from-amber-500 to-orange-500' },
    { id: 'signed', name: 'Signed Copies', count: 18, color: 'from-emerald-500 to-green-500' },
    { id: 'vintage', name: 'Vintage Books', count: 36, color: 'from-rose-500 to-red-500' },
    { id: 'illustrated', name: 'Illustrated', count: 42, color: 'from-indigo-500 to-blue-500' },
  ];

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await categoryAPI.getAllCategories();
        const apiCategories = response.data?.categories || [];
        
        if (apiCategories.length > 0) {
          // Map API categories with styling
          const styledCategories = apiCategories.map((cat, idx) => ({
            id: (cat._id || cat.name || '').toLowerCase(),
            name: cat.name || cat,
            count: cat.count || Math.floor(Math.random() * 200) + 10,
            color: defaultCategories[idx % defaultCategories.length].color
          }));
          setCategories(styledCategories);
        } else {
          setCategories(defaultCategories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories(defaultCategories);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoadingBooks(true);
        const response = await bookAPI.getAllBooks({ limit: 50 });
        
        // Handle different API response formats
        let fetchedBooks = [];
        if (Array.isArray(response)) {
          fetchedBooks = response;
        } else if (response.data?.books && Array.isArray(response.data.books)) {
          fetchedBooks = response.data.books;
        } else if (response.data && Array.isArray(response.data)) {
          fetchedBooks = response.data;
        } else if (response.books && Array.isArray(response.books)) {
          fetchedBooks = response.books;
        }
        
        setBooks(fetchedBooks);
      } catch (error) {
        console.error('Failed to fetch books:', error);
        setBooks([]);
      } finally {
        setLoadingBooks(false);
      }
    };

    fetchBooks();
  }, []);

  const filters = [
    { id: 'bestseller', label: 'Bestsellers', icon: HiFire },
    { id: 'new', label: 'New Arrivals', icon: HiStar },
    { id: 'discount', label: 'On Sale', icon: HiTag },
    { id: 'in-stock', label: 'In Stock', icon: HiShieldCheck },
  ];

  const sortOptions = [
    { id: 'featured', label: 'Featured' },
    { id: 'newest', label: 'Newest' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'rating', label: 'Top Rated' },
  ];

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleFilterToggle = (filterId) => {
    setActiveFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setActiveFilters([]);
    setPriceRange([0, 500]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-indigo-950 text-white">
      {/* Hero Banner */}
      <div className="relative overflow-hidden py-16 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=2067')] opacity-10 bg-cover bg-center" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl lg:text-5xl font-bold mb-4"
            >
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Premium Collections
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-300 max-w-3xl mx-auto"
            >
              Discover rare editions, signed copies, and luxury bindings for the discerning collector
            </motion.p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-800 rounded-xl hover:border-cyan-500/30 transition-all"
          >
            <HiAdjustments className="w-5 h-5 text-cyan-400" />
            <span className="font-medium">Filters & Categories</span>
            {(selectedCategories.length > 0 || activeFilters.length > 0) && (
              <span className="ml-auto bg-cyan-500 text-white text-xs px-2 py-1 rounded-full">
                {selectedCategories.length + activeFilters.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-1/4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 sticky top-6"
            >
              {/* Categories */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <HiFilter className="w-5 h-5 text-cyan-400" />
                  Categories
                </h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                        selectedCategories.includes(category.id)
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30'
                          : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${category.color}`} />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <span className="text-xs bg-gray-800/50 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-4">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>₦{(priceRange[0] * 1000).toLocaleString()}</span>
                    <span>₦{(priceRange[1] * 1000).toLocaleString()}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-cyan-500 [&::-webkit-slider-thumb]:to-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-4">Filters</h3>
                <div className="grid grid-cols-2 gap-3">
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => handleFilterToggle(filter.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 ${
                        activeFilters.includes(filter.id)
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/30'
                          : 'bg-white/5 hover:bg-white/10 border-transparent hover:border-gray-700'
                      }`}
                    >
                      <filter.icon className={`w-5 h-5 mb-2 ${
                        activeFilters.includes(filter.id) ? 'text-cyan-400' : 'text-gray-400'
                      }`} />
                      <span className="text-xs text-center">{filter.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearAllFilters}
                className="w-full py-3 border-2 border-cyan-500/30 text-cyan-400 rounded-xl font-semibold hover:bg-cyan-500/10 transition-all"
              >
                Clear All Filters
              </button>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Toolbar */}
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">All Collections</h2>
                  <p className="text-gray-400 text-sm">Showing {books.length} premium book{books.length !== 1 ? 's' : ''}</p>
                </div>

                <div className="flex items-center gap-4">
                  {/* View Toggle */}
                  <div className="flex bg-gray-900/50 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === 'grid'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <HiViewGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === 'list'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <HiViewList className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-gray-900/50 border border-gray-800 rounded-xl pl-3 pr-8 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm w-40"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.id} value={option.id} className="bg-gray-900">
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                      <HiChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategories.length > 0 || activeFilters.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-800/50">
                  {selectedCategories.map((catId) => {
                    const cat = categories.find(c => c.id === catId);
                    return (
                      <span
                        key={catId}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-full text-sm"
                      >
                        {cat?.name}
                        <button
                          onClick={() => handleCategoryToggle(catId)}
                          className="hover:text-red-400"
                        >
                          <HiX className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                  {activeFilters.map((filterId) => {
                    const filter = filters.find(f => f.id === filterId);
                    return (
                      <span
                        key={filterId}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-sm"
                      >
                        {filter?.label}
                        <button
                          onClick={() => handleFilterToggle(filterId)}
                          className="hover:text-red-400"
                        >
                          <HiX className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-gray-400 hover:text-cyan-400"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Books Grid/List */}
            {loadingBooks ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 shadow-lg animate-pulse">
                    <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : books.length > 0 ? (
              viewMode === 'grid' ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {books.map((book, index) => (
                    <motion.div
                      key={book._id || book.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <BookCard book={book} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {books.map((book, index) => (
                    <motion.div
                      key={book._id || book.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl overflow-hidden shadow-lg"
                    >
                      <div className="flex flex-col md:flex-row p-6">
                        {/* Book Image */}
                        <div className="md:w-1/4 mb-4 md:mb-0">
                          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                            {book.image ? (
                              <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-24 h-32 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg shadow-lg" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Book Info */}
                        <div className="md:w-3/4 md:pl-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-300 mb-2">
                                {book.category || 'Fiction'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <HiStar className="w-4 h-4 text-amber-400 fill-amber-400" />
                              <span className="text-sm text-gray-700 font-semibold">{book.rating || 4.5}</span>
                            </div>
                          </div>
                          
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">{book.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                          <p className="text-gray-700 text-sm mb-4 line-clamp-2">{book.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <span className="text-3xl font-bold text-cyan-600">₦{Math.round(book.price).toLocaleString()}</span>
                                {book.discount && (
                                  <div className="text-sm text-red-600 font-semibold">
                                    Save {book.discount}%
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center gap-2 text-sm whitespace-nowrap">
                                <HiShoppingBag className="w-4 h-4" />
                                Add to Cart
                              </button>
                              <button className="px-4 py-2 border border-cyan-500/30 text-cyan-600 rounded-lg font-semibold hover:bg-cyan-500/10 transition-all text-sm whitespace-nowrap">
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            ) : (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <HiSparkles className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-100 mb-2">No Products Found                                                              </h3>
                <p className="text-gray-200">We're curating our collection. Check back soon for amazing books!</p>
              </div>
            )}

            {/* Pagination */}
            {books.length > 6 && !loadingBooks && (
              <div className="mt-8 lg:mt-12 flex justify-center">
              <nav className="flex items-center gap-2">
                <button className="px-4 py-2 border border-gray-800 rounded-xl hover:bg-white/5 transition-colors text-sm">
                  Previous
                </button>
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    className={`px-4 py-2 rounded-xl transition-colors text-sm ${
                      page === 1
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                        : 'border border-gray-800 hover:bg-white/5'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <span className="px-2 text-gray-500">...</span>
                {[8, 9, 10].map((page) => (
                  <button
                    key={page}
                    className="px-4 py-2 border border-gray-800 rounded-xl hover:bg-white/5 transition-colors text-sm"
                  >
                    {page}
                  </button>
                ))}
                <button className="px-4 py-2 border border-gray-800 rounded-xl hover:bg-white/5 transition-colors text-sm">
                  Next
                </button>
              </nav>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 lg:hidden"
            onClick={() => setIsMobileFilterOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween' }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-gradient-to-b from-gray-950 to-gray-900 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold">Filters</h2>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg"
                  >
                    <HiX className="w-6 h-6" />
                  </button>
                </div>

                {/* Categories */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-4">Categories</h3>
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryToggle(category.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                          selectedCategories.includes(category.id)
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${category.color}`} />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <span className="text-xs bg-gray-800/50 px-2 py-1 rounded-full">
                          {category.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-4">Price Range</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>₦{(priceRange[0] * 1000).toLocaleString()}</span>
                      <span>₦{(priceRange[1] * 1000).toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-cyan-500 [&::-webkit-slider-thumb]:to-blue-500"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-4">Filters</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {filters.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => handleFilterToggle(filter.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                          activeFilters.includes(filter.id)
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/30'
                            : 'bg-white/5 hover:bg-white/10 border-transparent'
                        }`}
                      >
                        <filter.icon className={`w-5 h-5 mb-2 ${
                          activeFilters.includes(filter.id) ? 'text-cyan-400' : 'text-gray-400'
                        }`} />
                        <span className="text-xs text-center">{filter.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Apply Filters Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryPage;