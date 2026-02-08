import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiSparkles, HiClock, HiStar,
  HiCheckCircle, HiTruck, HiArrowRight, HiFire,
  HiChevronLeft, HiChevronRight, HiShoppingCart,
  HiHeart, HiOutlineHeart, HiEye
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

const Landingpage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [newBooks, setNewBooks] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(new Set());
  const [swiperRef, setSwiperRef] = useState(null);

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
        // API may return categories either as `data` array or under `data.categories`
        const fetchedCategories = Array.isArray(response.data)
          ? response.data
          : (response.data?.categories || []);
        
        if (fetchedCategories.length > 0) {
          // Map API categories with default styling
          const styledCategories = fetchedCategories.slice(0, 8).map((cat, idx) => ({
            name: cat.name || cat,
            icon: defaultCategories[idx]?.icon || '📚',
            color: defaultCategories[idx]?.color || 'from-blue-500 to-cyan-500',
            bg: defaultCategories[idx]?.bg || 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10',
            count: cat.count || Math.floor(Math.random() * 1000) + 100
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
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await bookAPI.getAllBooks({ limit: 50 });
        const books = response.data?.books || response.data || [];

        if (books.length > 0) {
          setAllBooks(books);
          
          // Featured - first 4 books
          setFeaturedBooks(books.slice(0, 4));
          
          // New Arrivals - latest 6 products (assuming newer items are at the start or have a date)
          setNewBooks(books.slice(0, 6));
          
          // Top Products - sorted by rating (highest first)
          const sortedByRating = [...books].sort((a, b) => (b.rating || 0) - (a.rating || 0));
          setTopProducts(sortedByRating.slice(0, 4));
          
          // Trending - products with mixed characteristics (popular, recent, high rating)
          const trending = books.slice(0, 16).filter((_, idx) => idx % 2 === 0 || books[idx]?.rating >= 4.5);
          setTrendingBooks(trending.slice(0, 8));
          
          // Recently Viewed - from localStorage
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
          
          // If categories from API were not available, derive categories from books
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
  }, []);

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

  const BookCard = ({ book, index, showBadge = false, badgeText = 'New' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 relative"
    >
      {/* Discount Badge */}
      {book?.discount && book.discount > 0 && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            -{book.discount}%
          </div>
        </div>
      )}

      {/* New Badge */}
      {showBadge && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            {badgeText}
          </div>
        </div>
      )}

      {/* Wishlist Button */}
      <button
        onClick={() => toggleWishlist(book._id)}
        className="absolute top-3 right-3 z-10 flex items-center justify-center bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors"
      >
        {wishlist.has(book._id) ? (
          <HiHeart className="w-5 h-5 text-red-500" />
        ) : (
          <HiOutlineHeart className="w-5 h-5 text-gray-600 hover:text-red-500" />
        )}
      </button>

      {/* Book Image */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 h-64 flex items-center justify-center overflow-hidden">
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
        <h3 className="font-semibold text-gray-800 truncate hover:text-blue-600 cursor-pointer text-lg mb-1">
          {book?.title || 'Unknown'}
        </h3>
        <p className="text-sm text-gray-500 truncate mb-3">{book?.author || 'Unknown Author'}</p>
        
        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <HiStar key={i} className={`w-4 h-4 ${i < Math.floor(book?.rating || 4) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-2">({book?.reviews || 0} reviews)</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xl font-bold text-gray-900">₦{(book?.price || 0).toLocaleString()}</p>
            {book?.originalPrice && (
              <p className="text-sm text-gray-400 line-through">₦{book.originalPrice.toLocaleString()}</p>
            )}
          </div>
          {book?.stock && (
            <span className={`text-xs px-2 py-1 rounded-full ${book.stock > 10 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {book.stock > 10 ? 'In Stock' : 'Low Stock'}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/product/${book?._id}`)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <HiShoppingCart className="w-5 h-5" />
            Add to Cart
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Categories (20%), Flash Deals (60%) and Right Sidebar (20%) */}
      <section className="px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-4">
            {/* Categories - 20% width */}
            <div className="w-1/5 hidden md:block">
              <HeroLeftCategories />
            </div>
            
            {/* Flash Deals - 60% width */}
            <div className="flex-1">
              <HeroFlashDeals />
            </div>
            
            {/* Right Sidebar - 20% width */}
            <div className="w-1/5 hidden md:block">
              <HeroRightSidebar />
            </div>
          </div>
        </div>
      </section>

      {/* Flash Deals Countdown - Dynamic */}
      <FlashDeals />

      {/* Categories Grid */}
      <section className="py-4 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex bg-gradient-to-r p-4 rounded-tr-[4px] rounded-tl-[4px] from-red-500 to-orange-500 md:flex-row flex-wrap items-center justify-between mb-2">
            <h2 className="text-[17px] font-bold text-white">Shop by Category</h2>
            <Link to="/category" className="text-white hover:text-gray-300 font-semibold flex items-center gap-2 group">
              View All 
              <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="flex overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-8 gap-4 md:gap-[32px] md:overflow-visible">
            {loading ? (
              [...Array(8)].map((_, idx) => (
                <div style={{ minWidth: '150px' }} key={idx} className="bg-white rounded-xl p-4 shadow-lg animate-pulse">
                  <div className="bg-gray-200 h-16 rounded-lg mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-2 bg-gray-200 rounded"></div>
                    <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))
            ): 
              categories.map((cat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/category?category=${cat.name.toLowerCase()}`)}
                  className={`${cat.bg} rounded-xl p-4 cursor-pointer hover:shadow-xl transition-all text-center group border border-gray-200 flex-shrink-0 w-40 snap-center md:w-auto md:snap-none`}
                  style={{ minWidth: '150px' }}
                >
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${cat.color} text-white text-2xl mb-3 group-hover:scale-105 transition-transform duration-300`}>
                    {cat.icon}
                  </div>
                  <p className="font-semibold text-gray-800">{cat.name}</p>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-4 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex bg-gradient-to-r p-4 rounded-tr-[4px] rounded-tl-[4px] from-red-500 to-orange-500 md:flex-row flex-wrap items-center justify-between mb-2">
            <h2 className="text-[17px] font-bold text-white ">
              <span>Featured Books</span>
            </h2>
            <Link to="/category" className="text-white hover:text-gray-300 font-semibold flex items-center gap-2 group">
              View All 
              <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="flex overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-[32px] md:overflow-visible">
            {loading ? (
              // Loading skeletons
              [...Array(4)].map((_, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-lg animate-pulse">
                  <div style={{ minWidth: '160px' }} className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : featuredBooks.length > 0 ? (
              featuredBooks.map((book, idx) => (
                <div style={{ minWidth: '280px' }}>
                  <BookCard key={book._id} book={book} index={idx} />
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <HiSparkles className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon! 🎉</h3>
                <p className="text-gray-600">We're adding amazing books to our collection. Stay tuned!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* New Arrivals & Top Products Side by Side */}
      <section className="py-4 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-8">
            {/* New Arrivals */}
            <div>
              <div className="flex bg-gradient-to-r p-4 rounded-tr-[4px] rounded-tl-[4px] from-red-500 to-orange-500 md:flex-row flex-wrap items-center justify-between mb-2">
                <h2 className="text-[17px] font-bold text-white">
                  New Arrivals
                </h2>
                <Link to="/category?sort=newest" className="text-white hover:text-gray-300 text-sm font-medium">
                  See all →
                </Link>
              </div>
              <div className="flex overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-[32px] md:overflow-visible">
                {newBooks.length > 0 ? (
                  newBooks.slice(0, 4).map((book, idx) => (
                    <div style={{ minWidth: '280px' }}>
                      <BookCard key={book._id} book={book} index={idx} showBadge={true} badgeText="New" />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center text-gray-500">
                    <p>Coming Soon! 🎉</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Products */}
            <div>
              <div className="flex bg-gradient-to-r p-4 rounded-tr-[4px] rounded-tl-[4px] from-red-500 to-orange-500 md:flex-row flex-wrap items-center justify-between mb-2">
                <h2 className="text-white text-[17px] font-bold">
                  Top Products
                </h2>
                <Link to="/category?sort=rating" className="text-white hover:text-gray-300 text-sm font-medium">
                  See all →
                </Link>
              </div>
              <div className="flex overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-[32px] md:overflow-visible">
                {topProducts.length > 0 ? (
                  topProducts.slice(0, 4).map((book, idx) => (
                    <div style={{ minWidth: '280px' }}>
                      <BookCard key={book._id} book={book} index={idx} showBadge={true} badgeText="⭐ Top Rated" />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center text-gray-500">
                    <p>Coming Soon! 🎉</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <section className="py-4 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r p-4 rounded-tr-[4px] rounded-tl-[4px] from-red-500 to-orange-500 flex md:flex-row flex-wrap items-center justify-between md:gap-6 mb-6">
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
            <div className="flex overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-[32px] md:overflow-visible">
              {recentlyViewed.map((book, idx) => (
                <div style={{ minWidth: '280px' }}>
                  <BookCard key={book._id} book={book} index={idx} />
                </div>
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
              <div className="inline-flex p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg mb-4">
                <MdLocalShipping className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Free Delivery</h3>
              <p className="text-gray-600">On orders over ₦5,000</p>
            </motion.div>

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

      {/* Newsletter Section - This is separate from the Footer */}
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