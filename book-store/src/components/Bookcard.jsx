import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiShoppingBag, HiHeart, HiStar, HiEye, HiTrash, HiPlus } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext.jsx';
import { useWishlist } from '../contexts/WishlistContext.jsx';
import toast from 'react-hot-toast';
import { getResponsiveImageSrcSet } from '../utils/imageOptimization';

// ---------------------------------------------------------------------
// Same palette as Landingpage.jsx / ProductDetail.jsx / CategoryPage.jsx.
// Consider moving this into a shared /lib/theme.js and importing it in
// all four files instead of repeating the block.
// ---------------------------------------------------------------------
const PURPLE = ['#5B21B6', '#6D28D9', '#7C3AED', '#8B5CF6', '#A78BFA'];
const AMBER = '#D97706';
const DEEP = '#4C1D95';
const DANGER = '#DC2626';

const tintFor = (label = '') => {
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = label.charCodeAt(i) + ((hash << 5) - hash);
  return PURPLE[Math.abs(hash) % PURPLE.length];
};

// Small circular icon button shared by the overlay and the price-row
// cart action, so both places stay visually identical.
const IconButton = ({ onClick, disabled, active, activeColor, idleColor = '#94A3B8', idleBg = 'rgba(255,255,255,0.9)', title, children, loading }) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.92 }}
    className="w-10 h-10 flex items-center justify-center rounded-full border shadow-sm transition-colors duration-200 flex-shrink-0"
    style={
      active
        ? { background: activeColor, borderColor: activeColor, color: '#fff' }
        : { background: idleBg, borderColor: 'rgba(0,0,0,0.08)', color: idleColor }
    }
  >
    {loading ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : children}
  </motion.button>
);

const BookCard = ({ book = {} }) => {
  const { addToCart, removeFromCart, cart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const navigate = useNavigate();
  // Get book ID
  const bookId = book._id || book.id;
  const tint = tintFor(book.category?.name || book.category || book.title);
  const price = Number(book.price) || 0;
  const imageSource = getResponsiveImageSrcSet(book.image);
  const discount = Number(book.discount) || 0;
  const originalPrice = Number(book.originalPrice) || 0;
  const displayedPrice =
    originalPrice > price
      ? price
      : Number(book.finalPrice) || price * (1 - discount / 100);
  const comparisonPrice = originalPrice > price ? originalPrice : price;

  // Check if book is in cart
  useEffect(() => {
    if (bookId && cart) {
      const inCart = cart.some(item => (item.id === bookId || item._id === bookId || item.book === bookId));
      setIsInCart(inCart);
    }
  }, [bookId, cart]);

  // Initialize isLiked based on wishlist status
  useEffect(() => {
    if (bookId) {
      setIsLiked(isInWishlist(bookId));
    }
  }, [bookId, isInWishlist]);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!bookId) {
      toast.error('Cannot add to wishlist: Book ID is missing');
      return;
    }

    console.log('Wishlist clicked for book:', bookId, 'isLiked:', isLiked);

    if (isLiked) {
      removeFromWishlist(bookId);
      setIsLiked(false);
      toast.success('Removed from wishlist', {
        icon: '💔',
        style: { background: '#1E1B29', color: '#fff', border: '1px solid #4C1D95' }
      });
    } else {
      const added = addToWishlist(book);
      if (added) {
        setIsLiked(true);
        toast.success('Added to wishlist!', {
          icon: '❤️',
          style: { background: '#1E1B29', color: '#fff', border: '1px solid #4C1D95' }
        });
      }
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);
    addToCart(book, 1, e.currentTarget);
    // toast.success(`${book.title || 'Book'} added to cart!`);

    setTimeout(() => setIsAdding(false), 300);
  };

  const handleRemoveFromCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);
    removeFromCart(bookId, e.currentTarget);
    // toast.success(`${book.title || 'Book'} removed from cart!`);

    setTimeout(() => setIsAdding(false), 300);
  };

  const discountBadge = book.discount && book.discount > 0 ? (
    <span className="px-3 py-1.5 text-white text-xs font-semibold rounded-full shadow-sm" style={{ background: AMBER }}>
      {book.discount}% OFF
    </span>
  ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative h-full"
      data-cart-animation-product
      onClick={(e) => {navigate(`/product/${bookId}`); e.preventDefault(); e.stopPropagation();}}
    >
      <div
        className="relative flex h-full flex-col bg-white border border-black/[0.06] rounded-2xl overflow-hidden transition-all duration-300"
        style={{ boxShadow: isHovered ? `0 16px 32px -12px ${tint}40` : '0 2px 10px rgba(30,27,41,0.05)' }}
      >
        <div className="h-[3px] w-full" style={{ background: tint }} />

        {/* Premium Badges */}
        <div className="absolute top-4 left-3 z-10 flex flex-col gap-2">
          {book.edition && (
            <span className="px-3 py-1.5 text-white text-xs font-semibold rounded-full shadow-sm" style={{ background: `linear-gradient(120deg, ${tint}, ${DEEP})` }}>
              {book.edition}
            </span>
          )}
          {discountBadge}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3.5 right-3 z-10 p-1 flex items-center justify-center rounded-full backdrop-blur-sm border shadow-sm transition-all duration-200"
          style={
            isLiked
              ? { background: `${AMBER}18`, borderColor: `${AMBER}55`, color: AMBER }
              : { background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.08)', color: '#94A3B8' }
          }
          aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <HiHeart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Book Image */}
        <Link to={`/product/${bookId}`} className="block h-[160px] shrink-0">
          <div className="relative h-full overflow-hidden cursor-pointer" style={{ background: `${tint}0D` }}>
            <motion.div
              animate={{ rotateY: isHovered ? 14 : 0, rotateX: isHovered ? -4 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <img
                {...(imageSource || {})}
                src={imageSource?.src || book.image || "https://placehold.co/320x480"}
                alt={book.title || "Book Cover"}
                loading="lazy"
                decoding="async"
                className="w-full h-full! object-contain p-2 rounded shadow-lg"
              />
            </motion.div>

            {/* Hover Overlay — icon-only actions */}
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hidden absolute inset-0 bg-ink/25 flex items-center justify-center gap-2.5"
              >
                {isInCart ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}>
                    <IconButton
                      onClick={handleRemoveFromCart}
                      disabled={isAdding}
                      active
                      activeColor={DANGER}
                      title="Remove from cart"
                      loading={isAdding}
                    >
                      <HiTrash className="w-4.5 h-4.5" />
                    </IconButton>
                  </motion.div>
                ) : (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}>
                    <IconButton
                      onClick={handleAddToCart}
                      disabled={isAdding}
                      active
                      activeColor={tint}
                      title="Add to cart"
                      loading={isAdding}
                    >
                      <HiShoppingBag className="w-4.5 h-4.5" />
                    </IconButton>
                  </motion.div>
                )}
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15 }}>
                  <Link to={`/product/${bookId}`}>
                    <IconButton title="Quick view" idleColor={DEEP}>
                      <HiEye className="w-4.5 h-4.5" />
                    </IconButton>
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </div>
        </Link>

        {/* Book Details */}
        <div className="flex flex-1 flex-col p-3">
          {/* Title */}
          <h3 className="font-serif font-extrabold uppercase text-ink text-[14px] mb-1 line-clamp-2">
            {book.title || 'Premium Book'}
          </h3>

          {/* Author */}
          <p className="text-xs font-medium text-ink/50 mb-1.5">
            by {book.author || 'Unknown Author'}
          </p>

          {/* Rating */}
          {book.rating > 0 && (
            <div className="flex items-center gap-1 mb-2.5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <HiStar
                    key={i}
                    className={`w-3.5 h-3.5 ${i < Math.round(book.rating) ? 'fill-current' : 'text-ink/15'}`}
                    style={i < Math.round(book.rating) ? { color: AMBER } : {}}
                  />
                ))}
              </div>
              <span className="text-xs text-ink/40">{book.rating.toFixed(1)}</span>
            </div>
          )}

          {/* Description */}
          <p className="text-xs text-ink/40 mb-4 line-clamp-2 leading-relaxed">
            {book.description || 'Premium collector\'s edition with exquisite binding and features'}
          </p>

          {/* Features */}
          {book.features && book.features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-black/[0.06]">
              {book.features.slice(0, 2).map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-full border"
                  style={{ background: `${tint}12`, borderColor: `${tint}30`, color: DEEP }}
                >
                  {feature}
                </span>
              ))}
            </div>
          )}

          {/* Price & Action */}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
            <div>
              <div className="text-[11px] text-ink/40">Price</div>
              <div className="flex items-baseline gap-2 font-mono">
                {discount > 0 ? (
                  <>
                    <span className="text-lg font-bold text-ink">
                      ₦{new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(displayedPrice)}
                    </span>
                    {comparisonPrice > displayedPrice && (
                      <span className="text-sm text-ink/30 line-through">
                        ₦{new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(comparisonPrice)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-lg font-bold text-ink">
                    ₦{new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(book.price || 0)}
                  </span>
                )}
              </div>
            </div>

            {/* Add/Remove Cart — icon-only, mirrors the overlay action */}
            {isInCart ? (
              <IconButton
                onClick={handleRemoveFromCart}
                disabled={isAdding}
                active
                activeColor={DANGER}
                title="Remove from cart"
                loading={isAdding}
              >
                <HiTrash className="w-4.5 h-4.5" />
              </IconButton>
            ) : (
              <IconButton
                onClick={handleAddToCart}
                disabled={isAdding}
                active
                activeColor={tint}
                title="Add to cart"
                loading={isAdding}
              >
                <HiPlus className="w-5 h-5" />
              </IconButton>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookCard;