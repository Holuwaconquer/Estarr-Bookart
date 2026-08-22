import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSparkles, HiShoppingCart, HiHeart, HiOutlineHeart, HiEye, HiTrash } from 'react-icons/hi';
import { MdLocalShipping, MdSecurity, MdHeadsetMic } from 'react-icons/md';
import { bookAPI, categoryAPI } from '../services/api';
import toast from 'react-hot-toast';
import FlashDeals from '../components/FlashDeals';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

// ---------------------------------------------------------------------
// Palette — purple-led, two disciplined accents.
// PURPLE does category tinting, gradients, and hover states (5 tonal
// steps, never jumps hue). AMBER marks warmth/urgency (sale, new,
// wishlist). TEAL marks trust (security, shipping, support). Nothing
// else. Keep in sync with Navbar.jsx.
// ---------------------------------------------------------------------
const PURPLE = ['#5B21B6', '#6D28D9', '#7C3AED', '#8B5CF6', '#A78BFA'];
const AMBER = '#D97706';
const TEAL = '#0F766E';
const DEEP = '#4C1D95';
const DANGER = '#DC2626';

const tintFor = (label = '') => {
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = label.charCodeAt(i) + ((hash << 5) - hash);
  return PURPLE[Math.abs(hash) % PURPLE.length];
};

const defaultCategories = [
  { name: 'Fiction' }, { name: 'Non-Fiction' }, { name: 'Romance' }, { name: 'Mystery' },
  { name: 'Science' }, { name: 'History' }, { name: 'Biography' }, { name: 'Self-Help' },
];

// Floating gradient blob — pure motion graphics, no images needed.
const Blob = ({ color, size, style, duration = 14, delay = 0 }) => (
  <motion.div
    className="absolute rounded-full blur-3xl opacity-20 pointer-events-none"
    style={{ width: size, height: size, background: color, ...style }}
    animate={{ x: [0, 40, -30, 0], y: [0, -30, 20, 0], scale: [1, 1.15, 0.95, 1] }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

const Landingpage = () => {
  const navigate = useNavigate();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [newBooks, setNewBooks] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAllCategories();
        const fetched = Array.isArray(response.data) ? response.data : (response.data?.categories || []);
        setCategories(fetched.length > 0 ? fetched.map((cat) => ({ name: cat.name || cat })) : defaultCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories(defaultCategories);
      }
    };
    fetchCategories();
  }, []);

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
          setNewBooks(books.slice(0, 8));

          const viewed = localStorage.getItem('recentlyViewed');
          if (viewed) {
            try {
              const viewedIds = JSON.parse(viewed);
              setRecentlyViewed(viewedIds.map((id) => books.find((b) => b._id === id)).filter(Boolean).slice(0, 6));
            } catch (e) {
              setRecentlyViewed([]);
            }
          }

          const derived = Array.from(
            new Set(books.map((b) => (b.category?.name || b.category || '').toString().trim()).filter(Boolean))
          );
          if (derived.length > 0) {
            setCategories((prev) =>
              prev[0]?.name === defaultCategories[0].name ? derived.slice(0, 8).map((name) => ({ name })) : prev
            );
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

  useEffect(() => {
    if (selectedCategory) {
      const filtered = allBooks.filter(
        (book) => (book.category?.name || book.category || '').toLowerCase() === selectedCategory.toLowerCase()
      );
      setFilteredBooks(filtered.slice(0, 20));
    } else {
      setFilteredBooks(featuredBooks);
    }
  }, [selectedCategory, allBooks, featuredBooks]);

  const toggleWishlist = (bookId) => {
    setWishlist((prev) => {
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

  // ---------------------------------------------------------------------
  // Book card. `eager` = animate on mount (used for the first, above-fold
  // grid so it's guaranteed to play without waiting for scroll). Every
  // other grid uses whileInView since the user has to scroll to reach it.
  // ---------------------------------------------------------------------
  const BookCard = ({ book, index, eager = false }) => {
    const { addToCart, removeFromCart, cart } = useCart();
    const [isInCart, setIsInCart] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const tint = tintFor(book?.category?.name || book?.category || book?.title);

    useEffect(() => {
      if (book?._id && cart) {
        setIsInCart(cart.some((item) => item.id === book._id || item._id === book._id || item.book === book._id));
      }
    }, [book, cart]);

    const handleAddToCart = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsProcessing(true);
      await addToCart(book);
      toast.success(`${book?.title || 'Book'} added to cart`);
      setTimeout(() => setIsProcessing(false), 800);
    };

    const handleRemoveFromCart = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsProcessing(true);
      await removeFromCart(book._id);
      toast.success(`${book?.title || 'Book'} removed from cart`);
      setTimeout(() => setIsProcessing(false), 800);
    };

    const motionProps = eager
      ? { initial: { opacity: 0, y: 24, scale: 0.96 }, animate: { opacity: 1, y: 0, scale: 1 } }
      : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-40px' } };

    return (
      <motion.div
        {...motionProps}
        transition={{ delay: Math.min(index * 0.05, 0.6), type: 'spring', stiffness: 200, damping: 22 }}
        whileHover={{ y: -8 }}
        onClick={() => navigate(`/product/${book?._id}`)}
        className="group relative bg-white rounded-2xl overflow-hidden border border-black/[0.06] transition-all duration-300 cursor-pointer"
        style={{ boxShadow: '0 2px 10px rgba(30,27,41,0.05)' }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 16px 32px -12px ${tint}40`; e.currentTarget.style.borderColor = `${tint}66`; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(30,27,41,0.05)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; }}
      >
        <div className="h-[3px] w-full" style={{ background: tint }} />

        <div className="relative h-[190px] flex items-center justify-center overflow-hidden" style={{ background: `${tint}0D` }}>
          <motion.img
            src={book?.image || book?.coverImage || `https://via.placeholder.com/250x300?text=${encodeURIComponent(book?.title || 'Book')}`}
            alt={book?.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.4 }}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/250x300?text=No+Image'; }}
          />

          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { toggleWishlist(book._id); e.stopPropagation(); }}
            aria-label="Toggle wishlist"
            className="absolute top-2.5 right-2.5 flex items-center justify-center bg-white/90 backdrop-blur-sm w-8 h-8 rounded-full shadow-md"
          >
            {wishlist.has(book._id) ? <HiHeart className="w-4 h-4" style={{ color: AMBER }} /> : <HiOutlineHeart className="w-4 h-4 text-ink/50" />}
          </motion.button>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-ink/0 group-hover:bg-ink/15">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={(e) => { e.stopPropagation(); navigate(`/product/${book?._id}`); }}
              className="bg-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg"
              style={{ color: DEEP }}
            >
              <HiEye className="w-4 h-4" /> Quick view
            </motion.button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-serif text-[17px] leading-snug text-ink line-clamp-1">{book?.title || 'Unknown'}</h3>
          <p className="text-xs text-ink/50 mt-1 mb-3 truncate">{book?.author || 'Unknown author'}</p>

          <div className="flex items-center gap-2 mb-3">
            <p className="font-mono text-base font-bold text-ink">&#8358;{(book?.price || 0).toLocaleString()}</p>
            {book?.originalPrice && (
              <p className="font-mono text-xs text-ink/30 line-through">&#8358;{book.originalPrice.toLocaleString()}</p>
            )}
          </div>

          {isInCart ? (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleRemoveFromCart}
              disabled={isProcessing}
              className="w-full text-sm py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-white"
              style={{ background: DANGER }}
            >
              {isProcessing ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : (<><HiTrash className="w-4 h-4" /> Remove</>)}
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleAddToCart}
              disabled={isProcessing}
              className="w-full text-sm py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-white"
              style={{ background: `linear-gradient(120deg, ${tint}, ${DEEP})` }}
            >
              {isProcessing ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : (<><HiShoppingCart className="w-4 h-4" /> Add to cart</>)}
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-paper overflow-x-hidden">
      {/* ------------------------------------------------------------- */}
      {/* Catalog — the page opens directly on books. A slim animated    */}
      {/* strip + drifting purple blobs carry the motion.                */}
      {/* ------------------------------------------------------------- */}
      <section id="catalog" className="relative pt-6 pb-6 px-4 overflow-hidden">
        <Blob color={PURPLE[1]} size={320} style={{ top: '-140px', left: '-80px' }} duration={16} />
        <Blob color={PURPLE[3]} size={260} style={{ top: '-100px', right: '-60px' }} duration={13} delay={1} />

        <div className="relative max-w-7xl mx-auto">
          {/* Category bubbles */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex gap-2.5 overflow-x-auto pb-0 -mx-1 px-1 scrollbar-hide"
          >
            {categories.map((category, idx) => {
              const tint = tintFor(category.name);
              const active = selectedCategory === category.name;
              return (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + idx * 0.04 }}
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategorySelect(category.name)}
                  className="flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors"
                  style={
                    active
                      ? { background: `linear-gradient(120deg, ${tint}, ${DEEP})`, color: 'white', boxShadow: `0 8px 20px ${tint}55` }
                      : { background: `${tint}14`, color: tint }
                  }
                >
                  {category.name}
                </motion.button>
              );
            })}
            <AnimatePresence>
              {selectedCategory && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => handleCategorySelect('')}
                  className="flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-bold text-white"
                  style={{ background: '#14121F' }}
                >
                  Clear ×
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* Book grid — visible the instant the page loads                */}
      {/* ------------------------------------------------------------- */}
      <section className="py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
              [...Array(12)].map((_, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: idx * 0.05 }}
                  className="bg-white rounded-2xl overflow-hidden"
                >
                  <div className="bg-ink/5 h-[190px]" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-ink/10 rounded w-4/5" />
                    <div className="h-3 bg-ink/10 rounded w-1/2" />
                    <div className="h-10 bg-ink/10 rounded-xl mt-2" />
                  </div>
                </motion.div>
              ))
            ) : filteredBooks.length > 0 ? (
              filteredBooks.map((book, idx) => <BookCard key={book._id} book={book} index={idx} eager={idx < 8} />)
            ) : (
              <div className="col-span-full py-16 text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                  style={{ background: `linear-gradient(120deg, ${PURPLE[1]}, ${DEEP})` }}
                >
                  <HiSparkles className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="font-serif text-xl text-ink mb-2">No books on this shelf yet</h3>
                <p className="text-ink/50">Nothing available in {selectedCategory} right now.</p>
                <button onClick={() => handleCategorySelect('')} className="mt-4 font-bold underline underline-offset-4" style={{ color: PURPLE[0] }}>
                  Browse all books
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Flash deals — existing component */}
      <FlashDeals />

      {/* ------------------------------------------------------------- */}
      {/* New arrivals                                                   */}
      {/* ------------------------------------------------------------- */}
      {!loading && newBooks.length > 0 && (
        <section className="py-10 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-serif text-3xl text-ink mb-5 flex items-center gap-3">
              Fresh off the press
              <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-2xl">
                <HiSparkles style={{ color: AMBER }} />
              </motion.span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {newBooks.slice(0, 4).map((book, idx) => <BookCard key={book._id} book={book} index={idx} />)}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Recently viewed                                                */}
      {/* ------------------------------------------------------------- */}
      {recentlyViewed.length > 0 && (
        <section className="py-10 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-3xl text-ink">Recently viewed</h2>
              <button onClick={() => setRecentlyViewed([])} className="text-sm text-ink/50 hover:text-ink font-semibold">
                Clear history
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {recentlyViewed.map((book, idx) => <BookCard key={book._id} book={book} index={idx} />)}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Value props — purple primary, teal for trust, amber for support */}
      {/* ------------------------------------------------------------- */}
      <section className="py-16 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {[
            { icon: MdSecurity, title: 'Secure payment', body: '100% protected checkout', tint: TEAL },
            { icon: MdLocalShipping, title: 'Nationwide delivery', body: 'Shipped from Ile-Ife to you', tint: PURPLE[1] },
            { icon: MdHeadsetMic, title: 'Real support', body: 'A person answers, always', tint: AMBER },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="rounded-2xl p-7 bg-white border border-black/[0.05]"
              style={{ boxShadow: `0 8px 24px ${item.tint}1A` }}
            >
              <div className="inline-flex p-3.5 rounded-2xl mb-4" style={{ background: `${item.tint}18` }}>
                <item.icon className="w-6 h-6" style={{ color: item.tint }} />
              </div>
              <h3 className="font-serif text-lg text-ink mb-1">{item.title}</h3>
              <p className="text-ink/50 text-sm">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* Newsletter — deep purple close, single hue, no clash           */}
      {/* ------------------------------------------------------------- */}
      <section className="relative py-20 px-4 overflow-hidden" style={{ background: `linear-gradient(120deg, ${DEEP}, ${PURPLE[1]})` }}>
        <Blob color={PURPLE[3]} size={300} style={{ top: '-80px', left: '-60px' }} duration={12} />
        <Blob color={AMBER} size={200} style={{ bottom: '-60px', right: '-40px' }} duration={14} delay={1} />
        <div className="relative max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full bg-white/20 text-white mb-4">
              <HiSparkles className="w-3.5 h-3.5" /> The reading list
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">New arrivals, in your inbox.</h2>
            <p className="text-white/80 mb-8">One email, once a week — new titles, quiet discounts, nothing else.</p>
            <form
              onSubmit={(e) => { e.preventDefault(); toast.success('Subscribed'); }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                placeholder="you@email.com"
                className="flex-1 px-5 py-4 rounded-full bg-white/15 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/60"
              />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="bg-white px-7 py-4 rounded-full font-bold" style={{ color: DEEP }}>
                Subscribe
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landingpage;