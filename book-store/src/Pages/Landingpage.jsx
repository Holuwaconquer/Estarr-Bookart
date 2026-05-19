import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiSparkles, HiClock, HiStar,
  HiCheckCircle, HiTruck, HiArrowRight, HiFire,
  HiChevronLeft, HiChevronRight, HiShoppingCart,
  HiHeart, HiOutlineHeart, HiEye, HiChevronDown,HiTrash , HiChevronUp 
} from 'react-icons/hi';
import { FiBook, FiSearch, FiShoppingBag, FiPercent, FiBox } from 'react-icons/fi';
import { MdLocalShipping, MdSecurity, MdHeadsetMic } from 'react-icons/md';
import { bookAPI, categoryAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import FlashDeals from '../components/FlashDeals';
import HeroFlashDeals from '../components/HeroFlashDeals';
import HeroRightSidebar from '../components/HeroRightSidebar';
import HeroLeftCategories from '../components/HeroLeftCategories';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useCart } from '../contexts/CartContext';

const Landingpage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [newBooks, setNewBooks] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(new Set());
  const [swiperRef, setSwiperRef] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const scrollContainerRef = useRef(null);
  const { addToCart, removeFromCart, cart } = useCart()
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);

  const defaultCategories = [
    { name: 'Fiction', icon: '📚', color: 'from-red-500 to-orange-500', bg: 'bg-gradient-to-r from-red-500/10 to-orange-500/10', count: '1.2k' },
    { name: 'Non-Fiction', icon: '📖', color: 'from-blue-600 to-cyan-500', bg: 'bg-gradient-to-r from-blue-600/10 to-cyan-500/10', count: '890' },
    { name: 'Romance', icon: '💕', color: 'from-pink-500 to-rose-500', bg: 'bg-gradient-to-r from-pink-500/10 to-rose-500/10', count: '560' },
    { name: 'Mystery', icon: '🔍', color: 'from-purple-600 to-indigo-500', bg: 'bg-gradient-to-r from-purple-600/10 to-indigo-500/10', count: '340' },
    { name: 'Science', icon: '🔬', color: 'from-green-500 to-emerald-500', bg: 'bg-gradient-to-r from-green-500/10 to-emerald-500/10', count: '450' },
    { name: 'History', icon: '📜', color: 'from-amber-600 to-orange-500', bg: 'bg-gradient-to-r from-amber-600/10 to-orange-500/10', count: '670' },
    { name: 'Biography', icon: '👤', color: 'from-violet-600 to-purple-500', bg: 'bg-gradient-to-r from-violet-600/10 to-purple-500/10', count: '320' },
    { name: 'Self-Help', icon: '🌟', color: 'from-yellow-500 to-amber-500', bg: 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10', count: '780' },
  ];

  // Fetch categories from API on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryAPI.getAllCategories();
        console.log('Categories response:', response);
        const fetchedCategories = Array.isArray(response.data)
          ? response.data
          : (response.data?.categories || []);
        
        if (fetchedCategories?.length > 0) {
          const styledCategories = fetchedCategories.map((cat, idx) => ({
            name: cat.name || cat
          }));
          setCategories(styledCategories);
        } else {
          setCategories(defaultCategories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories(defaultCategories);
      }
    };

    fetchCategories();
  }, []);

  // Fetch books on mount and organize them
  useEffect(() => {
    document.title = 'EStarr Bookart | Your Home of Good Books';
    window.scrollTo(0, 0);

    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await bookAPI.getAllBooks({ limit: 50 });
        const books = response.data?.books || response.data || [];

        if (books.length > 0) {
          setAllBooks(books);
          setFeaturedBooks(books.slice(0, 20));
          setFilteredBooks(books.slice(0, 20));
          
          setNewBooks(books.slice(0, 6));
          
          const sortedByRating = [...books].sort((a, b) => (b.rating || 0) - (a.rating || 0));
          setTopProducts(sortedByRating.slice(0, 4));
          
          const trending = books.slice(0, 16).filter((_, idx) => idx % 2 === 0 || books[idx]?.rating >= 4.5);
          setTrendingBooks(trending.slice(0, 8));
          
          const viewed = localStorage.getItem('recentlyViewed');
          if (viewed) {
            try {
              const viewedIds = JSON.parse(viewed);
              const viewedBooks = viewedIds
                .map(id => books.find(b => b._id === id))
                .filter(b => b)
                .slice(0, 6);
              setRecentlyViewed(viewedBooks);
            } catch (e) {
              setRecentlyViewed([]);
            }
          }
          
          try {
            const currentCats = categories || [];
            const isShowingDefaults = currentCats.length === 0 || (currentCats[0] && currentCats[0].name === defaultCategories[0].name);
            if (isShowingDefaults) {
              const derived = Array.from(new Set(books.map(b => (b.category?.name || b.category || '').toString().trim()).filter(Boolean)));
              if (derived.length > 0) {
                const styled = derived.slice(0, 8).map((name, idx) => ({
                  name,
                  icon: defaultCategories[idx]?.icon || '📚',
                  color: defaultCategories[idx]?.color || 'from-blue-500 to-cyan-500',
                  bg: defaultCategories[idx]?.bg || 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10',
                  count: Math.floor(Math.random() * 1000) + 50
                }));
                setCategories(styled);
              }
            }
          } catch (e) {
            // ignore derivation errors
          }
        }
      } catch (error) {
        console.error('Failed to fetch books:', error);
        toast.error('Failed to load books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();

    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);

  }, []);

  // Filter books by category
  useEffect(() => {
    if (selectedCategory) {
      const filtered = allBooks.filter(book => {
        const bookCategory = (book.category?.name || book.category || '').toLowerCase();
        return bookCategory === selectedCategory.toLowerCase();
      });
      setFilteredBooks(filtered.slice(0, 20));
    } else {
      setFilteredBooks(featuredBooks);
    }
  }, [selectedCategory, allBooks, featuredBooks]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/category?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const toggleWishlist = (bookId) => {
    setWishlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookId)) {
        newSet.delete(bookId);
        toast.success('Removed from wishlist');
      } else {
        newSet.add(bookId);
        toast.success('Added to wishlist');
      }
      return newSet;
    });
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName === selectedCategory ? '' : categoryName);
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const BookCard = ({ book, index, showBadge = false, badgeText = 'New' }) => {
    const { addToCart, removeFromCart, cart } = useCart();
    const [isInCart, setIsInCart] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Check if book is in cart
    useEffect(() => {
      if (book?._id && cart) {
        const inCart = cart.some(item => (item.id === book._id || item._id === book._id || item.book === book._id));
        setIsInCart(inCart);
      }
    }, [book, cart]);

    const handleAddToCart = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      setIsProcessing(true);
      await addToCart(book);
      toast.success(`${book?.title || 'Book'} added to cart!`);
      setTimeout(() => setIsProcessing(false), 800);
    };

    const handleRemoveFromCart = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      setIsProcessing(true);
      await removeFromCart(book._id);
      toast.success(`${book?.title || 'Book'} removed from cart!`);
      setTimeout(() => setIsProcessing(false), 800);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -8 }}
        onClick={() => navigate(`/product/${book?._id}`)}
        className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 relative"
      >
        {/* New Badge */}
        {/* {showBadge && (
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              {badgeText}
            </div>
          </div>
        )} */}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {toggleWishlist(book._id); e.stopPropagation()}}
          className="absolute top-3 right-3 z-10 flex items-center justify-center bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          {wishlist.has(book._id) ? (
            <HiHeart className="w-5 h-5 text-red-500" />
          ) : (
            <HiOutlineHeart className="w-5 h-5 text-gray-600 hover:text-red-500" />
          )}
        </button>

        {/* Book Image */}
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 h-[180px] flex items-center justify-center overflow-hidden">
          <motion.img
            src={book?.image || book?.coverImage || `https://via.placeholder.com/250x300?text=${encodeURIComponent(book?.title || 'Book')}`}
            alt={book?.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            whileHover={{ scale: 1.1 }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/250x300?text=No+Image';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Quick View Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/product/${book?._id}`)}
              className="bg-white/90 backdrop-blur-sm text-gray-900 px-6 py-2 rounded-full font-semibold flex items-center gap-2 shadow-lg"
            >
              <HiEye className="w-5 h-5" />
              Quick View
            </motion.button>
          </div>
        </div>
        
        {/* Book Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer text-lg">
            {book?.title || 'Unknown'}
          </h3>
          <p className="text-sm text-gray-500 truncate mb-3">{book?.author || 'Unknown Author'}</p>
          
          {/* Price */}
          <div className="flex flex-wrap items-center justify-between mb-4">
            <div className='flex items-center gap-1'>
              <p className="text-xl font-bold text-gray-900">₦{(book?.price || 0).toLocaleString()}</p>
              {book?.originalPrice && (
                <p className="text-sm text-gray-400 line-through">₦{book.originalPrice.toLocaleString()}</p>
              )}
            </div>
            {/* {book?.stock && (
              <span className={`text-xs px-2 py-1 rounded-full ${book.stock > 10 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {book.stock > 5 ? 'In Stock' : 'Low Stock'}
              </span>
            )} */}
          </div>

          {/* Action Buttons - Now shows Remove when in cart */}
          <div className="flex gap-2">
            {isInCart ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRemoveFromCart}
                disabled={isProcessing}
                className="flex-1 text-[12px] md:text-[16px] bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <HiTrash className="w-5 h-5" />
                    Remove
                  </>
                )}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                disabled={isProcessing}
                className="flex-1 text-[12px] md:text-[16px] bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <HiShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="hidden text-center mb-12 ">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
          EStarr Bookart Hub
        </h1>
        <p className="text-xl text-gray-600 mt-4">
          Also known as <strong>Estarr Bookart</strong> or <strong>Esther Bookart</strong> - Your Trusted Bookstore in Nigeria
        </p>
        <p className="text-gray-500 mt-2">
          Founded by Esther Adeleke | Quality Books | Free Delivery Across Nigeria
        </p>
      </div>
      {/* Featured Books with Horizontal Category Filter */}
      <section className="py-4 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Custom Category Select Dropdown */}
          <div className="w-full mb-6" ref={categoryDropdownRef}>
            <div className="w-full relative">
              {/* Dropdown Trigger */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="w-full flex items-center justify-between gap-3 px-6 py-2 bg-white border-2 border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-full flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-800 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span className="text-lg font-semibold text-gray-800">
                    {selectedCategory ? selectedCategory : 'Browse Collection'}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isCategoryDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isCategoryDropdownOpen ? (
                    <HiChevronUp className="w-5 h-5 text-purple-600" />
                  ) : (
                    <HiChevronDown className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  )}
                </motion.div>
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isCategoryDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scaleY: 0 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: -10, scaleY: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-20 origin-top"
                  >
                    <div className="max-h-80 overflow-y-auto">
                      {/* Browse Collection Option */}
                      <button
                        onClick={() => {
                          handleCategorySelect('');
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-all duration-200 border-b border-gray-100 ${
                          !selectedCategory ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700' : 'text-gray-700'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          !selectedCategory ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold">Browse Collection</p>
                          <p className="text-xs text-gray-500">View all books in our store</p>
                        </div>
                        {!selectedCategory && (
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      {/* Category Options */}
                      {categories.map((category, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleCategorySelect(category.name);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-all duration-200 border-b border-gray-100 last:border-0 ${
                            selectedCategory === category.name ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700' : 'text-gray-700'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            selectedCategory === category.name ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            <span className="text-sm font-bold">{category.name.charAt(0)}</span>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-semibold">{category.name}</p>
                            {/* <p className="text-xs text-gray-500">{category.count || 0} products</p> */}
                          </div>
                          {selectedCategory === category.name && (
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Selected Category Badge (optional) */}
            {selectedCategory && (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-sm text-gray-500">Filtering by:</span>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {selectedCategory}
                  <button
                    onClick={() => handleCategorySelect('')}
                    className="hover:text-purple-900 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-[32px]">
            {loading ? (
              [...Array(4)].map((_, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-lg animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : filteredBooks.length > 0 ? (
              filteredBooks.map((book, idx) => (
                <BookCard key={book._id} book={book} index={idx} />
              ))
            ) : (
              <div className="col-span-full py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <HiSparkles className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Books Found</h3>
                <p className="text-gray-600">No books available in {selectedCategory} category.</p>
                <button
                  onClick={() => handleCategorySelect('')}
                  className="mt-4 text-purple-600 hover:text-purple-700 font-semibold underline"
                >
                  Browse all books
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Flash Deals Countdown - Dynamic */}
      <FlashDeals />

      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <section className="py-4 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r px-4 py-2 rounded-tr-[4px] rounded-tl-[4px] from-purple-500 to-purple-800 flex md:flex-row flex-wrap items-center justify-between md:gap-6 mb-6">
              <h2 className="text-[17px] md:text-3xl font-bold text-gray-200">
                <span className="text-white">
                  Recently Viewed
                </span>
              </h2>
              <button
                onClick={() => setRecentlyViewed([])}
                className="text-sm text-gray-200 hover:text-gray-400 font-medium"
              >
                Clear History
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-[32px]">
              {recentlyViewed.map((book, idx) => (
                <BookCard key={book._id} book={book} index={idx} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Value Propositions */}
      <section className="py-12 px-4 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-lg text-center"
            >
              <div className="inline-flex p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg mb-4">
                <MdSecurity className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-gray-600">100% secure checkout</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-lg text-center"
            >
              <div className="inline-flex p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg mb-4">
                <FiPercent className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Best Price</h3>
              <p className="text-gray-600">Price match guarantee</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-lg text-center"
            >
              <div className="inline-flex p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg mb-4">
                <MdHeadsetMic className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">Dedicated customer service</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Stay in the Loop!</h2>
            <p className="text-blue-100 mb-6 text-lg">Subscribe to get exclusive deals, new arrivals, and special offers</p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
              >
                Subscribe
              </motion.button>
            </form>
            <p className="text-white/60 text-sm mt-4">By subscribing, you agree to our Privacy Policy</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landingpage;