import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiHeart, HiShoppingBag, HiStar, HiEye, HiCheck } from 'react-icons/hi';
import { useCart } from '../contexts/CartContext';

const LuxuryBookCard = ({ book }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(book);
    setTimeout(() => setIsAdding(false), 800);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <div className="relative bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300">
        {/* Edition Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1.5 bg-gradient-to-r from-amber-500/90 to-amber-600/90 text-white text-xs font-medium rounded-full shadow-lg">
            {book.edition}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 transition-colors"
        >
          <HiHeart className={`w-4 h-4 ${isLiked ? 'text-rose-500 fill-rose-500' : 'text-gray-400 hover:text-rose-400'}`} />
        </button>

        {/* Book Image */}
        <Link to={`/product/${book.id}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-amber-900/20 to-amber-800/20">
            <img
              src={book.image}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            
            {/* Hover Overlay */}
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center gap-2"
              >
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/product/${book.id}`);
                  }}
                  className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <HiEye className="w-4 h-4" />
                  Quick View
                </motion.button>
              </motion.div>
            )}
          </div>
        </Link>

        {/* Book Details */}
        <div className="p-5">
          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <HiStar
                key={i}
                className={`w-3 h-3 ${i < Math.floor(book.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`}
              />
            ))}
            <span className="text-xs text-gray-400 ml-2">{book.rating}</span>
          </div>

          {/* Title */}
          <h3 className="font-medium text-white text-sm mb-2 line-clamp-1 group-hover:text-amber-300 transition-colors">
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-xs text-gray-400 mb-3 line-clamp-1">
            {book.author}
          </p>

          {/* Features */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {book.features.slice(0, 2).map((feature, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded border border-amber-500/20"
              >
                {feature}
              </span>
            ))}
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">Price</div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-medium text-white">
                  {formatPrice(book.price)}
                </span>
                {book.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(book.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <motion.button
              onClick={handleAddToCart}
              disabled={isAdding}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                isAdding
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg hover:shadow-amber-500/25'
              }`}
            >
              {isAdding ? (
                <>
                  <HiCheck className="w-4 h-4" />
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
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      </div>
    </motion.div>
  );
};

export default LuxuryBookCard;