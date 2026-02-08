import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookAPI, reviewAPI, cartAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { motion } from 'framer-motion';
import { HiHeart, HiShoppingBag, HiStar, HiArrowLeft, HiCheckCircle, HiTruck, HiShieldCheck, HiFire, HiPlus, HiMinus } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useWishlist } from '../contexts/WishlistContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    if (book && id) {
      setIsLiked(isInWishlist(id));
    }
  }, [book, id, isInWishlist]);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        // Fetch real book data from API
        const allBooks = await bookAPI.getAllBooks({ limit: 100 });
        const books = allBooks.data?.books || allBooks.data || [];
        
        const foundBook = books.find(b => b._id === id || b.id === id);
        
        if (foundBook) {
          setBook(foundBook);
        } else {
          // Fallback to mock data if book not found
          setBook({
            _id: id,
            title: "The Silent Sea",
            author: "Clive Cussler",
            price: 89.99,
            originalPrice: 129.99,
            rating: 4.9,
            stock: 12,
            pages: 384,
            edition: "Limited Edition",
            publisher: "Random House",
            publishedYear: 2023,
            description: "A thrilling aquatic adventure that takes you to the depths of the ocean. With premium leather binding and hand-stitched pages, this limited edition is a collector's masterpiece.",
            category: "Fiction",
            discount: 15,
            features: ["Gold Foiling", "Hand-Stitched", "Signed Copy"]
          });
        }
        
        setReviews([
          { _id: "1", user: { name: "Sarah" }, rating: 5, comment: "Amazing book! Absolutely loved it.", createdAt: new Date() },
          { _id: "2", user: { name: "John" }, rating: 4, comment: "Great read, highly recommended.", createdAt: new Date() }
        ]);

        // Track recently viewed products
        const viewed = localStorage.getItem('recentlyViewed');
        let viewedList = [];
        try {
          viewedList = viewed ? JSON.parse(viewed) : [];
        } catch (e) {
          viewedList = [];
        }

        // Add current product to recently viewed if not already there
        if (!viewedList.includes(id)) {
          viewedList.unshift(id);
        } else {
          // Move to front if already exists
          viewedList = viewedList.filter(item => item !== id);
          viewedList.unshift(id);
        }

        // Keep only last 10 viewed products
        viewedList = viewedList.slice(0, 10);
        localStorage.setItem('recentlyViewed', JSON.stringify(viewedList));
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast.error('Failed to load product');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, navigate]);



  const handleAddToCart = () => {
    setAddingToCart(true);
    addToCart(book);
    toast.success(`${book.title} added to cart!`, {
      icon: '🛒',
      style: {
        background: '#1e293b',
        color: '#fff',
        border: '1px solid #334155'
      }
    });
    setTimeout(() => setAddingToCart(false), 800);
  };

  const handleAddToWishlist = () => {
    if (!book) return;
    
    if (isLiked) {
      // Remove from wishlist
      removeFromWishlist(id);
      setIsLiked(false);
      toast.success('Removed from wishlist', {
        icon: '💔',
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid #334155'
        }
      });
    } else {
      // Add to wishlist
      const added = addToWishlist(book);
      if (added) {
        setIsLiked(true);
        toast.success('Added to wishlist!', {
          icon: '❤️',
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155'
          }
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-indigo-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-transparent border-t-cyan-500 border-r-blue-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-indigo-950 flex items-center justify-center">
        <p className="text-xl text-gray-400">Product not found</p>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 4.5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-indigo-950 text-white pt-10 pb-16">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -left-64 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Back Button */}
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 font-medium transition-colors"
        >
          <HiArrowLeft className="w-5 h-5" />
          Back to Shopping
        </motion.button>

        {/* Product Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left - Book Showcase */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            {/* Book Cover */}
            <div className="relative md:aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-cyan-500/30 mb-6 flex items-center justify-center p-4">
              {/* 3D Book Effect or Image Gallery */}
              <motion.div
                whileHover={{ scale: 1.05, rotateY: 10 }}
                transition={{ duration: 0.3 }}
                className="relative w-48 h-64"
              >
                {book.images && book.images.length > 0 ? (
                  // Display actual images
                  <div className="relative w-full h-full">
                    <img
                      src={book.images[selectedImageIndex]?.url || book.images[selectedImageIndex]}
                      alt={book.title}
                      className="w-full h-full object-cover rounded-lg shadow-2xl"
                    />
                    {/* Image Counter */}
                    {book.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/80 px-3 py-1 rounded-full text-sm text-white">
                        {selectedImageIndex + 1}/{book.images.length}
                      </div>
                    )}
                  </div>
                ) : book.image ? (
                  // Fallback to single image
                  <div className="relative w-full h-full">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-full object-cover rounded-lg shadow-2xl"
                    />
                  </div>
                ) : (
                  // Placeholder 3D book effect
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-700 to-blue-700 rounded-lg shadow-2xl transform rotate-1" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-full mb-4">
                        <div className="h-3 bg-white/20 rounded-full mb-3" />
                        <div className="h-2 bg-white/15 rounded-full mb-2 w-3/4 mx-auto" />
                        <div className="h-2 bg-white/15 rounded-full w-2/3 mx-auto" />
                      </div>
                      <div className="text-4xl font-bold text-white/80 text-center leading-tight">
                        {book.title?.split(' ')[0]}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </div>

            {/* Image Thumbnails */}
            {book.images && book.images.length > 1 && (
              <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                {book.images.map((img, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-cyan-400 shadow-lg shadow-cyan-500/50'
                        : 'border-gray-600 hover:border-cyan-400/50'
                    }`}
                  >
                    <img
                      src={img.url || img}
                      alt={`${book.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}

            {/* Book Info Badges */}
            <div className="flex flex-wrap gap-2">
              {book.discount && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 bg-gradient-to-r from-red-500/80 to-pink-500/80 rounded-full text-sm font-semibold flex items-center gap-2"
                >
                  <HiFire className="w-4 h-4" />
                  {book.discount}% OFF
                </motion.div>
              )}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500/80 to-blue-500/80 rounded-full text-sm font-semibold"
              >
                {book.edition}
              </motion.div>
              {book.stock > 0 && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 bg-gradient-to-r from-green-500/80 to-emerald-500/80 rounded-full text-sm font-semibold flex items-center gap-1"
                >
                  <HiCheckCircle className="w-4 h-4" />
                  In Stock
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right - Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-between"
          >
            {/* Title Section */}
            <div>
              <div className="mb-4">
                <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded-full text-sm text-cyan-300">
                  {book.category}
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {book.title}
              </h1>

              <p className="text-xl text-gray-300 mb-6">
                by <span className="text-cyan-400 font-semibold">{book.author}</span>
              </p>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <HiStar
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-300">{avgRating}</span>
                <span className="text-gray-400">({reviews.length} reviews)</span>
              </div>

              {/* Description */}
              <p className="text-gray-300 leading-relaxed mb-8">
                {book.description}
              </p>

              {/* Features */}
              {book.features && book.features.length > 0 && (
                <div className="mb-8">
                  <p className="text-sm text-gray-400 mb-3">Special Features</p>
                  <div className="flex flex-wrap gap-2">
                    {book.features.map((feature, idx) => (
                      <motion.span
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 rounded-full text-sm text-purple-300"
                      >
                        ✨ {feature}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pricing & Purchase Section */}
            <div className="space-y-6">
              {/* Price */}
              <div>
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    NGN {book.price?.toLocaleString()}
                  </span>
                  {book.originalPrice && book.originalPrice > book.price && (
                    <span className="text-lg text-gray-500 line-through">
                      NGN {book.originalPrice?.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-green-400 font-medium flex items-center gap-2">
                  <HiCheckCircle className="w-5 h-5" />
                  {book.stock} copies available
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-gray-300 font-medium">Quantity:</span>
                <div className="flex items-center gap-2 bg-gray-900/50 border border-gray-800/50 rounded-lg p-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-cyan-400 hover:bg-gray-800/50 rounded transition-colors"
                  >
                    <HiMinus className="w-5 h-5" />
                  </motion.button>
                  <span className="px-6 py-2 text-lg font-semibold text-white min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setQuantity(Math.min(book.stock || 10, quantity + 1))}
                    className="p-2 text-cyan-400 hover:bg-gray-800/50 rounded transition-colors"
                  >
                    <HiPlus className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/50"
                >
                  {addingToCart ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <HiShoppingBag className="w-5 h-5" />
                      Add to Cart
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToWishlist}
                  className={`w-full px-6 py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all border backdrop-blur-sm ${
                    isLiked
                      ? 'bg-red-500/20 border-red-500/50 text-red-400'
                      : 'bg-gray-900/50 border-gray-800/50 text-gray-300 hover:text-red-400 hover:border-red-500/50'
                  }`}
                >
                  <HiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? 'Added to Wishlist' : 'Add to Wishlist'}
                </motion.button>
              </div>

              {/* Shipping Info */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-800/50">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="p-3 bg-gray-900/50 border border-gray-800/50 rounded-lg text-center"
                >
                  <HiTruck className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">Free Shipping</p>
                  <p className="text-xs text-gray-500">On orders over ₦5,000</p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="p-3 bg-gray-900/50 border border-gray-800/50 rounded-lg text-center"
                >
                  <HiShieldCheck className="w-5 h-5 text-green-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">30-day Returns</p>
                  <p className="text-xs text-gray-500">Hassle-free guarantee</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8"
        >
          <h2 className="text-3xl font-bold mb-8 text-white">Customer Reviews ({reviews.length})</h2>

          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review, idx) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="pb-6 border-b border-gray-700/50 last:border-0"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/50 to-blue-500/50 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {review.user?.name?.[0] || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <p className="font-semibold text-white">{review.user?.name || 'Anonymous'}</p>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <HiStar
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-300 mb-2">{review.comment}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No reviews yet</p>
              <p className="text-gray-500">Be the first to share your thoughts about this book!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;
