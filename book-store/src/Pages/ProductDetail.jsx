import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookAPI, reviewAPI, cartAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { motion } from 'framer-motion';
import { HiHeart, HiShoppingBag, HiStar, HiArrowLeft, HiCheckCircle, HiTruck, HiShieldCheck, HiFire, HiPlus, HiMinus, HiTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useWishlist } from '../contexts/WishlistContext';
import BookCard from '../components/Bookcard';

// ---------------------------------------------------------------------
// Same palette as Landingpage.jsx — purple does the work, amber marks
// warmth/urgency, teal marks trust, red is reserved for destructive
// actions only. Keep these three files in sync (or better, move this
// block into a shared /lib/theme.js and import it everywhere).
// ---------------------------------------------------------------------
const PURPLE = ['#5B21B6', '#6D28D9', '#7C3AED', '#8B5CF6', '#A78BFA'];
const AMBER = '#D97706';
const TEAL = '#0F766E';
const DEEP = '#4C1D95';
const DANGER = '#DC2626';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, removeFromCart, cart } = useCart();
  const [book, setBook] = useState(null);
  const [allBooks, setAllBooks] = useState([]);
  const [recentlyViewedBooks, setRecentlyViewedBooks] = useState([]);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Check if book is in cart
  useEffect(() => {
    if (id && cart) {
      const inCart = cart.some(item => (item.id === id || item._id === id || item.book === id));
      setIsInCart(inCart);
    }
  }, [id, cart]);

  useEffect(() => {
    if (book && id) {
      setIsLiked(isInWishlist(id));
    }
  }, [book, id, isInWishlist]);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const allBooks = await bookAPI.getAllBooks({ limit: 100 });
        const books = allBooks.data?.books || allBooks.data || [];
        setAllBooks(books);

        const foundBook = books.find(b => b._id === id || b.id === id);

        if (foundBook) {
          setBook(foundBook);
        } else {
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

        const currentBook = foundBook || null;
        const currentCategory = (currentBook?.category?.name || currentBook?.category || '').toString().trim().toLowerCase();
        const bookId = currentBook?._id || currentBook?.id || id;

        // Track recently viewed products and resolve their full book records.
        const viewed = localStorage.getItem('recentlyViewed');
        let viewedList = [];
        try {
          viewedList = viewed ? JSON.parse(viewed) : [];
        } catch (e) {
          viewedList = [];
        }

        if (!viewedList.includes(bookId)) {
          viewedList.unshift(bookId);
        } else {
          viewedList = viewedList.filter(item => item !== bookId);
          viewedList.unshift(bookId);
        }

        viewedList = viewedList.slice(0, 10);
        localStorage.setItem('recentlyViewed', JSON.stringify(viewedList));

        setRecentlyViewedBooks(
          viewedList
            .map(viewedId => books.find(item => (item._id || item.id) === viewedId))
            .filter(item => item && (item._id || item.id) !== bookId)
            .slice(0, 6)
        );

        setSimilarBooks(
          books
            .filter(item => {
              const itemId = item._id || item.id;
              const itemCategory = (item.category?.name || item.category || '').toString().trim().toLowerCase();
              return itemId !== bookId && currentCategory && itemCategory === currentCategory;
            })
            .slice(0, 6)
        );
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

  const handleAddToCart = async () => {
    if (!book) return;

    setAddingToCart(true);
    await addToCart(book, quantity);

    setTimeout(() => setAddingToCart(false), 800);
  };

  const handleRemoveFromCart = async () => {
    if (!id) return;

    setAddingToCart(true);
    await removeFromCart(id);

    setTimeout(() => setAddingToCart(false), 800);
  };

  const handleAddToWishlist = () => {
    if (!book) return;

    if (isLiked) {
      removeFromWishlist(id);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-11 h-11 border-4 rounded-full animate-spin" style={{ borderColor: `${PURPLE[2]}22`, borderTopColor: PURPLE[0] }} />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-xl text-ink/50">Product not found</p>
      </div>
    );
  }

  const recommendationBooks = similarBooks.length > 0
    ? similarBooks
    : allBooks.filter(item => (item._id || item.id) !== (book._id || book.id)).slice(0, 6);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 4.5;

  return (
    <div className="min-h-screen bg-paper text-ink pt-10 pb-20 relative overflow-hidden">
      {/* Two restrained purple blobs — same signature as the landing page, kept quiet here */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-24 -left-40 w-80 h-80 rounded-full blur-3xl opacity-[0.06]" style={{ background: PURPLE[1] }} />
        <div className="absolute bottom-24 -right-40 w-80 h-80 rounded-full blur-3xl opacity-[0.06]" style={{ background: PURPLE[3] }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 font-semibold transition-colors"
          style={{ color: PURPLE[0] }}
        >
          <HiArrowLeft className="w-5 h-5" />
          Back to Shopping
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left — Book Showcase */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <div
              className="relative md:aspect-[3/4] rounded-2xl overflow-hidden bg-white border border-black/[0.06] mb-6 flex items-center justify-center p-4"
              style={{ boxShadow: '0 10px 40px rgba(76,29,149,0.08)' }}
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
                className="relative w-48 h-64"
              >
                {book.images && book.images.length > 0 ? (
                  <div className="relative w-full h-full">
                    <img
                      src={book.images[selectedImageIndex]?.url || book.images[selectedImageIndex]}
                      alt={book.title}
                      className="w-full h-full object-cover rounded-lg shadow-xl"
                    />
                    {book.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-ink/85 px-3 py-1 rounded-full text-sm text-white">
                        {selectedImageIndex + 1}/{book.images.length}
                      </div>
                    )}
                  </div>
                ) : book.image ? (
                  <div className="relative w-full h-full">
                    <img src={book.image} alt={book.title} className="w-full h-full object-cover rounded-lg shadow-xl" />
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-0 rounded-lg shadow-xl" style={{ background: `linear-gradient(135deg, ${PURPLE[1]}, ${DEEP})` }} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-full mb-4">
                        <div className="h-3 bg-white/20 rounded-full mb-3" />
                        <div className="h-2 bg-white/15 rounded-full mb-2 w-3/4 mx-auto" />
                        <div className="h-2 bg-white/15 rounded-full w-2/3 mx-auto" />
                      </div>
                      <div className="text-4xl font-serif font-semibold text-white/85 text-center leading-tight">
                        {book.title?.split(' ')[0]}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </div>

            {book.images && book.images.length > 1 && (
              <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {book.images.map((img, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all"
                    style={{ borderColor: selectedImageIndex === idx ? PURPLE[2] : '#E4E1EC' }}
                  >
                    <img src={img.url || img} alt={`${book.title} ${idx + 1}`} className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {book.discount && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 text-white"
                  style={{ background: AMBER }}
                >
                  <HiFire className="w-4 h-4" />
                  {book.discount}% OFF
                </motion.div>
              )}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                style={{ background: `linear-gradient(120deg, ${PURPLE[1]}, ${DEEP})` }}
              >
                {book.edition}
              </motion.div>
              {book.stock > 0 && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1 text-white"
                  style={{ background: TEAL }}
                >
                  <HiCheckCircle className="w-4 h-4" />
                  In Stock
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right — Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-between"
          >
            <div>
              <div className="mb-4">
                <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ background: `${PURPLE[2]}14`, color: PURPLE[0] }}>
                  {book.category}
                </span>
              </div>

              <h1 className="font-serif text-4xl lg:text-5xl font-semibold text-ink mb-2 leading-tight">
                {book.title}
              </h1>

              <p className="text-xl text-ink/60 mb-6">
                by <span className="font-semibold" style={{ color: PURPLE[0] }}>{book.author}</span>
              </p>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <HiStar
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(avgRating) ? 'fill-current' : 'text-ink/15'}`}
                      style={i < Math.floor(avgRating) ? { color: AMBER } : {}}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-ink">{avgRating}</span>
                <span className="text-ink/50">({reviews.length} reviews)</span>
              </div>

              <p className="text-ink/70 leading-relaxed mb-8">
                {book.description}
              </p>

              {book.features && book.features.length > 0 && (
                <div className="mb-8">
                  <p className="text-sm text-ink/50 mb-3">Special Features</p>
                  <div className="flex flex-wrap gap-2">
                    {book.features.map((feature, idx) => (
                      <motion.span
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        className="px-3 py-1 rounded-full text-sm font-medium border"
                        style={{ background: `${PURPLE[3]}14`, borderColor: `${PURPLE[3]}40`, color: DEEP }}
                      >
                        ✨ {feature}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="font-mono text-4xl font-bold text-ink">
                    &#8358;{book.price?.toLocaleString()}
                  </span>
                  {book.originalPrice && book.originalPrice > book.price && (
                    <span className="font-mono text-lg text-ink/30 line-through">
                      &#8358;{book.originalPrice?.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="font-medium flex items-center gap-2" style={{ color: TEAL }}>
                  <HiCheckCircle className="w-5 h-5" />
                  {book.stock} copies available
                </p>
              </div>

              {/* Only show quantity selector if item is NOT in cart */}
              {!isInCart && (
                <div className="flex items-center gap-4">
                  <span className="text-ink/70 font-medium">Quantity:</span>
                  <div className="flex items-center gap-2 bg-white border border-black/[0.08] rounded-lg p-1.5">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 rounded transition-colors hover:bg-black/[0.04]"
                      style={{ color: PURPLE[0] }}
                    >
                      <HiMinus className="w-5 h-5" />
                    </motion.button>
                    <span className="px-6 py-2 text-lg font-semibold text-ink min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setQuantity(Math.min(book.stock || 10, quantity + 1))}
                      className="p-2 rounded transition-colors hover:bg-black/[0.04]"
                      style={{ color: PURPLE[0] }}
                    >
                      <HiPlus className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-4">
                {isInCart ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRemoveFromCart}
                    disabled={addingToCart}
                    className="w-full px-6 py-4 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    style={{ background: DANGER, boxShadow: `0 10px 24px ${DANGER}33` }}
                  >
                    {addingToCart ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <HiTrash className="w-5 h-5" />
                        Remove from Cart
                      </>
                    )}
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="w-full px-6 py-4 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    style={{ background: `linear-gradient(120deg, ${PURPLE[1]}, ${DEEP})`, boxShadow: `0 10px 24px ${PURPLE[1]}40` }}
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
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToWishlist}
                  className="w-full px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border"
                  style={
                    isLiked
                      ? { background: `${AMBER}14`, borderColor: `${AMBER}55`, color: AMBER }
                      : { background: '#FFFFFF', borderColor: 'rgba(0,0,0,0.08)', color: '#64748B' }
                  }
                >
                  <HiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? 'Added to Wishlist' : 'Add to Wishlist'}
                </motion.button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-black/[0.06]">
                <motion.div whileHover={{ y: -2 }} className="p-3 bg-white border border-black/[0.06] rounded-lg text-center">
                  <HiTruck className="w-5 h-5 mx-auto mb-1" style={{ color: PURPLE[1] }} />
                  <p className="text-xs text-ink/60">Free Shipping</p>
                  <p className="text-xs text-ink/40">On orders over ₦5,000</p>
                </motion.div>
                <motion.div whileHover={{ y: -2 }} className="p-3 bg-white border border-black/[0.06] rounded-lg text-center">
                  <HiShieldCheck className="w-5 h-5 mx-auto mb-1" style={{ color: TEAL }} />
                  <p className="text-xs text-ink/60">30-day Returns</p>
                  <p className="text-xs text-ink/40">Hassle-free guarantee</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white border border-black/[0.06] rounded-2xl p-8"
          style={{ boxShadow: '0 4px 20px rgba(30,27,41,0.05)' }}
        >
          <h2 className="font-serif text-3xl font-semibold mb-8 text-ink">Customer Reviews ({reviews.length})</h2>

          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review, idx) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="pb-6 border-b border-black/[0.06] last:border-0"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${PURPLE[1]}, ${DEEP})` }}
                    >
                      {review.user?.name?.[0] || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <p className="font-semibold text-ink">{review.user?.name || 'Anonymous'}</p>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <HiStar
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-ink/15'}`}
                              style={i < review.rating ? { color: AMBER } : {}}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-ink/70 mb-2">{review.comment}</p>
                      <p className="text-sm text-ink/40">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-ink/60 text-lg mb-4">No reviews yet</p>
              <p className="text-ink/40">Be the first to share your thoughts about this book!</p>
            </div>
          )}
        </motion.div>

        {recommendationBooks.length > 0 && (
          <section className="mt-16" aria-labelledby="more-like-this-heading">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: PURPLE[0] }}>
                  Curated for you
                </p>
                <h2 id="more-like-this-heading" className="font-serif text-3xl font-semibold text-ink sm:text-4xl">
                  More books like this
                </h2>
                <p className="mt-2 max-w-xl text-sm text-ink/55">
                  Continue exploring stories selected from the same shelf.
                </p>
              </div>
              <button
                onClick={() => navigate('/category')}
                className="hidden text-sm font-semibold sm:block"
                style={{ color: PURPLE[0] }}
              >
                Browse all books
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {recommendationBooks.map((recommendedBook, index) => (
                <BookCard key={recommendedBook._id || recommendedBook.id} book={recommendedBook} index={index} />
              ))}
            </div>
          </section>
        )}

        {recentlyViewedBooks.length > 0 && (
          <section className="mt-16" aria-labelledby="recently-viewed-heading">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: AMBER }}>
                  Pick up where you left off
                </p>
                <h2 id="recently-viewed-heading" className="font-serif text-3xl font-semibold text-ink sm:text-4xl">
                  Recently viewed
                </h2>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('recentlyViewed');
                  setRecentlyViewedBooks([]);
                }}
                className="text-sm font-semibold text-ink/50 transition-colors hover:text-ink"
              >
                Clear history
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {recentlyViewedBooks.map((recentBook, index) => (
                <BookCard key={recentBook._id || recentBook.id} book={recentBook} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;