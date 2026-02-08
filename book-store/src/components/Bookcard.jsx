import React, { useState, useEffect } from 'react'; // Add useEffect import
import { Link } from 'react-router-dom';
import { HiShoppingBag, HiHeart, HiStar, HiEye } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext.jsx';
import { useWishlist } from '../contexts/WishlistContext.jsx';
import toast from 'react-hot-toast'; // Add toast import

const BookCard = ({ book = {} }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Get book ID
  const bookId = book._id || book.id;

  // Initialize isLiked based on wishlist status
  useEffect(() => {
    if (bookId) {
      setIsLiked(isInWishlist(bookId));
    }
  }, [bookId, isInWishlist]);

  const handleWishlist = (e) => {
    e.preventDefault(); // Prevent navigation if inside a link
    e.stopPropagation(); // Stop event bubbling
    
    if (!bookId) {
      toast.error('Cannot add to wishlist: Book ID is missing');
      return;
    }
    
    console.log('Wishlist clicked for book:', bookId, 'isLiked:', isLiked);
    
    if (isLiked) {
      // Remove from wishlist
      removeFromWishlist(bookId);
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

  const handleBuy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    addToCart(book);
    toast.success(`${book.title || 'Book'} added to cart!`);
    
    setTimeout(() => setIsAdding(false), 800);
  };

  // Fix the conditional rendering for discount badge
  const discountBadge = book.discount ? (
    <span className="px-3 py-1.5 bg-gradient-to-r from-red-500/90 to-pink-500/90 text-white text-xs font-semibold rounded-full shadow-lg">
      {book.discount}% OFF
    </span>
  ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <div className="relative bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl hover:border-cyan-500/30 transition-all duration-300 overflow-hidden">
        {/* Premium Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {book.edition && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/90 to-blue-500/90 text-white text-xs font-semibold rounded-full shadow-lg">
              {book.edition}
            </span>
          )}
          {discountBadge}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-sm border shadow-md transition-all duration-200 ${
            isLiked
              ? 'bg-red-500/20 border-red-500/50 text-red-400'
              : 'bg-gray-900/80 border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-500/50'
          }`}
          aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <HiHeart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Book Image */}
        <Link to={`/product/${bookId}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-cyan-500/10 to-blue-500/10 cursor-pointer">
            <div className="absolute inset-0 flex items-center justify-center p-4">
              {/* 3D Book Effect */}
              <div className="relative w-full h-full perspective-1000">
                <motion.div
                  animate={{
                    rotateY: isHovered ? 20 : 0,
                    rotateX: isHovered ? -5 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full transform-style-3d"
                >
                  <img 
                    src={book.image || "https://placehold.co/128x192"} 
                    alt={book.title || "Book Cover"} 
                    className="absolute inset-0 w-full h-full object-cover rounded shadow-2xl" 
                  />
                </motion.div>
              </div>
            </div>

            {/* Hover Overlay */}
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center gap-2"
              >
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  onClick={handleBuy}
                  disabled={isAdding}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center gap-2"
                >
                  {isAdding ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <HiShoppingBag className="w-4 h-4" />
                      Add to Cart
                    </>
                  )}
                </motion.button>
                <Link 
                  to={`/product/${bookId}`}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors flex items-center gap-2"
                >
                  <HiEye className="w-4 h-4" />
                  Quick View
                </Link>
              </motion.div>
            )}
          </div>
        </Link>

        {/* Book Details */}
        <div className="p-5">
          {/* Title */}
          <h3 className="font-bold text-white text-sm mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors">
            {book.title || 'Premium Book'}
          </h3>

          {/* Author */}
          <p className="text-xs text-gray-400 mb-3 line-clamp-1">
            by {book.author || 'Unknown Author'}
          </p>

          {/* Description */}
          <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">
            {book.description || 'Premium collector\'s edition with exquisite binding and features'}
          </p>

          {/* Price & Action */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">Price</div>
              <div className="flex items-baseline gap-2">
                {book.discount ? (
                  <>
                    <span className="text-lg font-bold text-white">
                      ₦{new Intl.NumberFormat('en-NG', {
                        maximumFractionDigits: 0,
                        minimumFractionDigits: 0
                      }).format(book.price * (1 - book.discount/100))}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ₦{new Intl.NumberFormat('en-NG', {
                        maximumFractionDigits: 0,
                        minimumFractionDigits: 0
                      }).format(book.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-white">
                    ₦{new Intl.NumberFormat('en-NG', {
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0
                    }).format(book.price || 0)}
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <motion.button
              onClick={handleBuy}
              disabled={isAdding}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                isAdding
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25'
              }`}
            >
              {isAdding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Added
                </>
              ) : (
                <>
                  <HiShoppingBag className="w-4 h-4" />
                  Add
                </>
              )}
            </motion.button>
          </div>

          {/* Features */}
          {book.features && book.features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-800/50">
              {book.features.slice(0, 2).map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-full border border-cyan-500/20"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      </div>
    </motion.div>
  );
};

export default BookCard;