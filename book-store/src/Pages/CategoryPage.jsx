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
  HiSparkles,
  HiTrash
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import BookCard from '../components/Bookcard.jsx';
import { bookAPI, categoryAPI } from '../services/api';
import { useCart } from '../contexts/CartContext.jsx';
import { useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getResponsiveImageSrcSet } from '../utils/imageOptimization';

// ---------------------------------------------------------------------
// Same palette as Landingpage.jsx / ProductDetail.jsx.
// ---------------------------------------------------------------------
const PURPLE = ['#5B21B6', '#6D28D9', '#7C3AED', '#8B5CF6', '#A78BFA'];
const AMBER = '#D97706';
const TEAL = '#0F766E';
const DEEP = '#4C1D95';
const DANGER = '#DC2626';
const normalizeCategoryName = (value) => String(value || '')
  .toLowerCase()
  .trim()
  .replace(/\s+/g, '-');

const CategoryPage = () => {
  const { addToCart, removeFromCart, cart } = useCart();
  const [searchParams] = useSearchParams();
  const { category: routeCategory } = useParams();
  const requestedCategory = searchParams.get('cat') || routeCategory || '';
  const searchQuery = (
    searchParams.get('q') || searchParams.get('search') || ''
  ).trim();
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [activeFilters, setActiveFilters] = useState([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});

  // Helper function to check if a book is in cart
  const isBookInCart = (bookId) => {
    return cart.some(item => (item.id === bookId || item._id === bookId || item.book === bookId));
  };

  // Handle add to cart
  const handleAddToCart = async (book, e) => {
    e.preventDefault();
    e.stopPropagation();

    const bookId = book._id || book.id;
    setAddingToCart(prev => ({ ...prev, [bookId]: 'adding' }));

    await addToCart(book);

    setTimeout(() => {
      setAddingToCart(prev => ({ ...prev, [bookId]: false }));
    }, 800);
  };

  // Handle remove from cart
  const handleRemoveFromCart = async (bookId, e) => {
    e.preventDefault();
    e.stopPropagation();

    setAddingToCart(prev => ({ ...prev, [bookId]: 'removing' }));

    await removeFromCart(bookId);

    setTimeout(() => {
      setAddingToCart(prev => ({ ...prev, [bookId]: false }));
    }, 800);
  };

  // Fallback categories — dot colors now cycle through the purple scale
  // instead of a different rainbow gradient per category.
  const defaultCategories = [
    { id: 'fiction', name: 'Fiction', count: 142, color: PURPLE[0] },
    { id: 'non-fiction', name: 'Non-Fiction', count: 89, color: PURPLE[1] },
    { id: 'limited-edition', name: 'Limited Editions', count: 24, color: PURPLE[2] },
    { id: 'signed', name: 'Signed Copies', count: 18, color: PURPLE[3] },
    { id: 'vintage', name: 'Vintage Books', count: 36, color: PURPLE[4] },
    { id: 'illustrated', name: 'Illustrated', count: 42, color: PURPLE[0] },
  ];

  const filterBooks = (booksArray) => {
    return booksArray.filter((book) => {
      // 1. Category filter
      if (selectedCategories.length > 0) {
        const normalizedBookCategory = normalizeCategoryName(
          typeof book.category === 'string' ? book.category : book.category?.name
        );
        const hasMatchingCategory = selectedCategories.includes(normalizedBookCategory);

        if (!hasMatchingCategory) {
          return false;
        }
      }

      // 2. Price range filter
      const bookPrice = book.price || 0;
      const minPrice = priceRange[0];
      const maxPrice = priceRange[1];
      if (bookPrice < minPrice || bookPrice > maxPrice) {
        return false;
      }

      // 3. Active filters
      if (activeFilters.length > 0) {
        if (activeFilters.includes('bestseller') && !book.isBestseller) {
          return false;
        }
        if (activeFilters.includes('new') && book.condition !== 'new') {
          return false;
        }
        if (activeFilters.includes('discount') && (!book.discount || book.discount <= 0)) {
          return false;
        }
        if (activeFilters.includes('in-stock') && (!book.stock || book.stock <= 0)) {
          return false;
        }
      }

      return true;
    });
  };

  // Create filtered books
  const filteredBooks = filterBooks(books);

  // Sort the filtered books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0);
      case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'featured':
      default:
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    }
  });

  // Fetch categories and books from API
  useEffect(() => {
    document.title = 'Books Page | EStarr Bookart';
    window.scrollTo(0, 0);

    const fetchData = async () => {
      try {
        setLoadingBooks(true);
        setLoadingCategories(true);

        // Fetch books
        const booksResponse = await bookAPI.getAllBooks({
          limit: 50,
          ...(searchQuery ? { search: searchQuery } : {}),
        });
        let fetchedBooks = [];

        if (Array.isArray(booksResponse)) {
          fetchedBooks = booksResponse;
        } else if (booksResponse.data?.books && Array.isArray(booksResponse.data.books)) {
          fetchedBooks = booksResponse.data.books;
        } else if (booksResponse.data && Array.isArray(booksResponse.data)) {
          fetchedBooks = booksResponse.data;
        } else if (booksResponse.books && Array.isArray(booksResponse.books)) {
          fetchedBooks = booksResponse.books;
        }

        console.log('Fetched books:', fetchedBooks);
        setBooks(fetchedBooks);
        setLoadingBooks(false);

        // Fetch categories
        try {
          const categoriesResponse = await categoryAPI.getAllCategories();
          const apiCategories = categoriesResponse.data || [];

          const bookCategories = [...new Set(fetchedBooks
            .filter(book => book.category)
            .map(book => book.category.trim())
          )];

          console.log('Book categories:', bookCategories);

          if (apiCategories.length > 0) {
            const styledCategories = apiCategories.map((cat, idx) => ({
              id: normalizeCategoryName(cat.name || cat),
              name: cat.name || cat,
              count: fetchedBooks.filter(book =>
                normalizeCategoryName(
                  typeof book.category === 'string' ? book.category : book.category?.name
                ) === normalizeCategoryName(cat.name || cat)
              ).length,
              color: PURPLE[idx % PURPLE.length]
            }));
            setCategories(styledCategories);
          } else if (bookCategories.length > 0) {
            const styledCategories = bookCategories.map((cat, idx) => ({
              id: normalizeCategoryName(cat),
              name: cat,
              count: fetchedBooks.filter(book =>
                normalizeCategoryName(book.category) === normalizeCategoryName(cat)
              ).length,
              color: PURPLE[idx % PURPLE.length]
            }));
            setCategories(styledCategories);
          } else {
            setCategories(defaultCategories);
          }
        } catch (categoryError) {
          console.error('Failed to fetch categories:', categoryError);
          const bookCategories = [...new Set(fetchedBooks
            .filter(book => book.category)
            .map(book => book.category.trim())
          )];

          if (bookCategories.length > 0) {
            const styledCategories = bookCategories.map((cat, idx) => ({
              id: normalizeCategoryName(cat),
              name: cat,
              count: fetchedBooks.filter(book =>
                normalizeCategoryName(book.category) === normalizeCategoryName(cat)
              ).length,
              color: PURPLE[idx % PURPLE.length]
            }));
            setCategories(styledCategories);
          } else {
            setCategories(defaultCategories);
          }
        }

        setLoadingCategories(false);

      } catch (error) {
        console.error('Failed to fetch data:', error);
        setBooks([]);
        setCategories(defaultCategories);
        setLoadingBooks(false);
        setLoadingCategories(false);
      }
    };

    fetchData();
  }, [searchQuery]);

  useEffect(() => {
    setSelectedCategories(requestedCategory ? [normalizeCategoryName(requestedCategory)] : []);
  }, [requestedCategory]);

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
    setPriceRange([0, 100000]);
  };

  const activeCategoryNames = categories
    .filter((category) => selectedCategories.includes(category.id))
    .map((category) => category.name);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <section className="relative isolate overflow-hidden bg-[#211238] text-white">
        <div
          className="absolute inset-0 -z-10 opacity-80"
          style={{
            background:
              'radial-gradient(circle at 82% 10%, rgba(139,92,246,.42), transparent 30%), radial-gradient(circle at 8% 100%, rgba(217,119,6,.18), transparent 34%), linear-gradient(115deg, #211238, #3B1765 62%, #4C1D95)',
          }}
        />
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                <HiSparkles className="h-4 w-4 text-amber-300" />
                The EStarr Bookshop
              </div>
              <p className="mt-5 text-sm font-semibold text-violet-200">
                {searchQuery ? 'Your search starts here' : 'A good book is never far away'}
              </p>
              <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                {searchQuery ? (
                  <>Results for <span className="text-amber-200">“{searchQuery}”</span></>
                ) : (
                  <>Find your next <span className="text-amber-200">favourite</span></>
                )}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
                Browse stories, ideas, and timeless reads selected for every kind of reader.
                Choose a shelf or refine the collection to find just the right book.
              </p>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <div className="min-w-32 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm">
                <p className="font-serif text-3xl font-semibold text-white">{sortedBooks.length}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-white/60">Books shown</p>
              </div>
              <div className="min-w-32 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm">
                <p className="font-serif text-3xl font-semibold text-white">{categories.length}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-white/60">Categories</p>
              </div>
            </div>
          </div>

          <div className="mt-9 border-t border-white/15 pt-6">
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedCategories([])}
                aria-pressed={selectedCategories.length === 0}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  selectedCategories.length === 0
                    ? 'border-white bg-white text-[#3B1765]'
                    : 'border-white/25 bg-white/5 text-white hover:bg-white/15'
                }`}
              >
                All books
              </button>
              {!loadingCategories && categories.slice(0, 8).map((category) => {
                const active = selectedCategories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryToggle(category.id)}
                    aria-pressed={active}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                      active
                        ? 'border-amber-200 bg-amber-200 text-[#32184e]'
                        : 'border-white/25 bg-white/5 text-white hover:bg-white/15'
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-black/[0.08] rounded-xl hover:border-black/[0.15] transition-all"
          >
            <HiAdjustments className="w-5 h-5" style={{ color: PURPLE[0] }} />
            <span className="font-medium text-ink">Filters & Categories</span>
            {(selectedCategories.length > 0 || activeFilters.length > 0) && (
              <span className="ml-auto text-white text-xs px-2 py-1 rounded-full" style={{ background: PURPLE[0] }}>
                {selectedCategories.length + activeFilters.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-72 lg:shrink-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border border-black/[0.06] rounded-2xl p-6 sticky top-6"
              style={{ boxShadow: '0 4px 20px rgba(30,27,41,0.05)' }}
            >
              {/* Categories */}
              <div className="mb-8">
                <h3 className="text-lg font-serif font-semibold text-ink mb-4 flex items-center gap-2">
                  <HiFilter className="w-5 h-5" style={{ color: PURPLE[0] }} />
                  Categories
                </h3>
                <div className="space-y-2.5">
                  {loadingCategories ? (
                    [...Array(3)].map((_, idx) => (
                      <div key={idx} className="w-full flex items-center justify-between p-3 rounded-xl bg-black/[0.03] animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-black/10" />
                          <div className="h-4 bg-black/10 rounded w-24"></div>
                        </div>
                        <div className="h-4 bg-black/10 rounded w-8"></div>
                      </div>
                    ))
                  ) : (
                    categories.map((category) => {
                      const active = selectedCategories.includes(category.id);
                      return (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryToggle(category.id)}
                          className="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 border"
                          style={
                            active
                              ? { background: `${PURPLE[2]}12`, borderColor: `${PURPLE[2]}55` }
                              : { background: 'transparent', borderColor: 'transparent' }
                          }
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: category.color }} />
                            <span className="text-sm font-medium text-ink">{category.name}</span>
                          </div>
                          <span className="text-xs bg-black/[0.05] text-ink/60 px-2 py-1 rounded-full">
                            {category.count}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <h3 className="text-lg font-serif font-semibold text-ink mb-4">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-ink/50 font-mono">
                    <span>₦{priceRange[0].toLocaleString()}</span>
                    <span>₦{priceRange[1].toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-1.5 bg-black/[0.08] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5B21B6] [&::-webkit-slider-thumb]:shadow-md"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="mb-8">
                <h3 className="text-lg font-serif font-semibold text-ink mb-4">Filters</h3>
                <div className="grid grid-cols-2 gap-3">
                  {filters.map((filter) => {
                    const active = activeFilters.includes(filter.id);
                    return (
                      <button
                        key={filter.id}
                        onClick={() => handleFilterToggle(filter.id)}
                        className="flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200"
                        style={
                          active
                            ? { background: `${PURPLE[2]}12`, borderColor: `${PURPLE[2]}55` }
                            : { background: 'transparent', borderColor: 'rgba(0,0,0,0.06)' }
                        }
                      >
                        <filter.icon className="w-5 h-5 mb-2" style={{ color: active ? PURPLE[0] : '#94A3B8' }} />
                        <span className="text-xs text-center text-ink/70">{filter.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearAllFilters}
                className="w-full py-3 border-2 rounded-xl font-semibold transition-all"
                style={{ borderColor: `${PURPLE[2]}40`, color: PURPLE[0] }}
              >
                Clear All Filters
              </button>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="bg-white border border-black/[0.06] rounded-2xl p-4 sm:p-6 mb-6" style={{ boxShadow: '0 4px 20px rgba(30,27,41,0.05)' }}>
              <div className="flex flex-wrap md:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">The collection</p>
                  <h2 className="mt-1 font-serif text-2xl font-semibold text-ink">
                    {activeCategoryNames.length ? activeCategoryNames.join(', ') : 'All books'}
                  </h2>
                  <p className="mt-1 text-ink/50 text-sm">
                    {searchQuery ? `Search results for “${searchQuery}” · ` : ''}
                    {sortedBooks.length} book{sortedBooks.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* View Toggle */}
                  {/* <div className="flex bg-black/[0.04] rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className="p-2 rounded-lg transition-all"
                      style={viewMode === 'grid' ? { background: PURPLE[0], color: '#fff' } : { color: '#94A3B8' }}
                    >
                      <HiViewGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className="p-2 rounded-lg transition-all"
                      style={viewMode === 'list' ? { background: PURPLE[0], color: '#fff' } : { color: '#94A3B8' }}
                    >
                      <HiViewList className="w-4 h-4" />
                    </button>
                  </div> */}

                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-black/[0.1] rounded-xl pl-3 pr-8 py-2 focus:ring-2 focus:outline-none text-sm w-40 text-ink"
                      style={{ '--tw-ring-color': `${PURPLE[2]}55` }}
                    >
                      {sortOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                      <HiChevronDown className="w-4 h-4 text-ink/40" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategories.length > 0 || activeFilters.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-black/[0.06]">
                  {selectedCategories.map((catId) => {
                    const cat = categories.find(c => c.id === catId);
                    return (
                      <span
                        key={catId}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border"
                        style={{ background: `${PURPLE[2]}12`, borderColor: `${PURPLE[2]}40`, color: DEEP }}
                      >
                        {cat?.name}
                        <button onClick={() => handleCategoryToggle(catId)} className="hover:opacity-60">
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
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border"
                        style={{ background: `${AMBER}14`, borderColor: `${AMBER}40`, color: AMBER }}
                      >
                        {filter?.label}
                        <button onClick={() => handleFilterToggle(filterId)} className="hover:opacity-60">
                          <HiX className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                  <button onClick={clearAllFilters} className="text-sm text-ink/50 hover:text-ink font-medium">
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Books Grid/List */}
            {loadingBooks ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-4 border border-black/[0.06] animate-pulse">
                    <div className="bg-black/[0.05] h-64 rounded-lg mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-black/[0.06] rounded"></div>
                      <div className="h-3 bg-black/[0.06] rounded w-3/4"></div>
                      <div className="h-4 bg-black/[0.06] rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedBooks.length > 0 ? (
              viewMode === 'grid' ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {sortedBooks.map((book, index) => (
                    <motion.div
                      key={book._id || book.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="h-full"
                    >
                      <BookCard book={book} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {sortedBooks.map((book, index) => {
                    const bookId = book._id || book.id;
                    const inCart = isBookInCart(bookId);
                    const isProcessing = addingToCart[bookId];
                    const imageSource = getResponsiveImageSrcSet(book.image, {
                      sizes: '(max-width: 768px) 90vw, 25vw',
                    });

                    return (
                      <motion.div
                        key={bookId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden"
                        style={{ boxShadow: '0 4px 20px rgba(30,27,41,0.05)' }}
                      >
                        <div className="flex flex-col md:flex-row p-6">
                          {/* Book Image */}
                          <div className="md:w-1/4 mb-4 md:mb-0">
                            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-black/[0.03]">
                              {book.image ? (
                                <img
                                  {...(imageSource || {})}
                                  src={imageSource?.src || book.image}
                                  alt={book.title}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full h-full! object-contain p-2"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-24 h-32 rounded-lg shadow-md" style={{ background: `linear-gradient(135deg, ${PURPLE[3]}, ${PURPLE[1]})` }} />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Book Info */}
                          <div className="md:w-3/4 md:pl-6">
                            <div className="flex items-start justify-between mb-3">
                              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full border mb-2" style={{ background: `${PURPLE[2]}12`, borderColor: `${PURPLE[2]}40`, color: DEEP }}>
                                {book.category || 'Fiction'}
                              </span>
                            </div>

                            <h3 className="font-serif text-2xl font-semibold text-ink mb-1">{book.title}</h3>
                            <p className="text-ink/60 text-sm mb-2">by {book.author}</p>
                            <p className="text-ink/70 text-sm mb-4 line-clamp-2">{book.description}</p>

                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div>
                                <span className="font-mono text-3xl font-bold text-ink">₦{Math.round(book.price).toLocaleString()}</span>
                                {book.discount && (
                                  <div className="text-sm font-semibold" style={{ color: AMBER }}>
                                    Save {book.discount}%
                                  </div>
                                )}
                              </div>
                              <div className="space-y-2">
                                {inCart ? (
                                  <button
                                    onClick={(e) => handleRemoveFromCart(bookId, e)}
                                    disabled={isProcessing === 'removing'}
                                    className="px-4 py-2 text-white rounded-lg font-semibold transition-all flex items-center gap-2 text-sm whitespace-nowrap w-full justify-center"
                                    style={{ background: DANGER }}
                                  >
                                    {isProcessing === 'removing' ? (
                                      <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Removing...
                                      </>
                                    ) : (
                                      <>
                                        <HiTrash className="w-4 h-4" />
                                        Remove
                                      </>
                                    )}
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => handleAddToCart(book, e)}
                                    disabled={isProcessing === 'adding'}
                                    className="px-4 py-2 text-white rounded-lg font-semibold transition-all flex items-center gap-2 text-sm whitespace-nowrap w-full justify-center"
                                    style={{ background: `linear-gradient(120deg, ${PURPLE[1]}, ${DEEP})` }}
                                  >
                                    {isProcessing === 'adding' ? (
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
                                  </button>
                                )}
                                <button
                                  onClick={() => window.location.href = `/product/${bookId}`}
                                  className="px-4 py-2 border rounded-lg font-semibold transition-all text-sm whitespace-nowrap w-full"
                                  style={{ borderColor: `${PURPLE[2]}40`, color: PURPLE[0] }}
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: `${PURPLE[2]}14` }}>
                  <HiSparkles className="w-8 h-8" style={{ color: PURPLE[0] }} />
                </div>
                <h3 className="text-xl font-serif font-semibold text-ink mb-2">No Products Found</h3>
                <p className="text-ink/50">We're curating our collection. Check back soon for amazing books!</p>
              </div>
            )}

            {/* Pagination */}
            {sortedBooks.length > 20 && !loadingBooks && (
              <div className="mt-8 lg:mt-12 flex justify-center">
                <nav className="flex items-center gap-1">
                  <button className="px-4 py-2 border border-black/[0.1] rounded-xl hover:bg-black/[0.03] transition-colors text-sm text-ink/70">
                    Previous
                  </button>
                  {[1, 2].map((page) => (
                    <button
                      key={page}
                      className="px-4 py-2 rounded-xl transition-colors text-sm"
                      style={page === 1 ? { background: PURPLE[0], color: '#fff' } : { border: '1px solid rgba(0,0,0,0.1)', color: '#1E1B29' }}
                    >
                      {page}
                    </button>
                  ))}
                  <span className="px-2 text-ink/30">...</span>
                  {[10].map((page) => (
                    <button
                      key={page}
                      className="px-4 py-2 border border-black/[0.1] rounded-xl hover:bg-black/[0.03] transition-colors text-sm text-ink/70"
                    >
                      {page}
                    </button>
                  ))}
                  <button className="px-4 py-2 border border-black/[0.1] rounded-xl hover:bg-black/[0.03] transition-colors text-sm text-ink/70">
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
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setIsMobileFilterOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween' }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-serif text-2xl font-semibold text-ink">Filters</h2>
                  <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 hover:bg-black/[0.05] rounded-lg">
                    <HiX className="w-6 h-6 text-ink/60" />
                  </button>
                </div>

                {/* Categories */}
                <div className="mb-8">
                  <h3 className="text-lg font-serif font-semibold text-ink mb-4">Categories</h3>
                  <div className="space-y-2.5">
                    {loadingCategories ? (
                      [...Array(3)].map((_, idx) => (
                        <div key={idx} className="w-full flex items-center justify-between p-3 rounded-xl bg-black/[0.03] animate-pulse">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-black/10" />
                            <div className="h-4 bg-black/10 rounded w-24"></div>
                          </div>
                          <div className="h-4 bg-black/10 rounded w-8"></div>
                        </div>
                      ))
                    ) : (
                      categories.map((category) => {
                        const active = selectedCategories.includes(category.id);
                        return (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryToggle(category.id)}
                            className="w-full flex items-center justify-between p-3 rounded-xl transition-all border"
                            style={active ? { background: `${PURPLE[2]}12`, borderColor: `${PURPLE[2]}55` } : { background: 'transparent', borderColor: 'transparent' }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ background: category.color }} />
                              <span className="text-sm font-medium text-ink">{category.name}</span>
                            </div>
                            <span className="text-xs bg-black/[0.05] text-ink/60 px-2 py-1 rounded-full">
                              {category.count}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-8">
                  <h3 className="text-lg font-serif font-semibold text-ink mb-4">Price Range</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-ink/50 font-mono">
                      <span>₦{priceRange[0].toLocaleString()}</span>
                      <span>₦{priceRange[1].toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="1000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-1.5 bg-black/[0.08] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5B21B6]"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="mb-8">
                  <h3 className="text-lg font-serif font-semibold text-ink mb-4">Filters</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {filters.map((filter) => {
                      const active = activeFilters.includes(filter.id);
                      return (
                        <button
                          key={filter.id}
                          onClick={() => handleFilterToggle(filter.id)}
                          className="flex flex-col items-center justify-center p-3 rounded-xl border transition-all"
                          style={active ? { background: `${PURPLE[2]}12`, borderColor: `${PURPLE[2]}55` } : { background: 'transparent', borderColor: 'rgba(0,0,0,0.06)' }}
                        >
                          <filter.icon className="w-5 h-5 mb-2" style={{ color: active ? PURPLE[0] : '#94A3B8' }} />
                          <span className="text-xs text-center text-ink/70">{filter.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Apply Filters Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 text-white rounded-xl font-semibold transition-all"
                  style={{ background: `linear-gradient(120deg, ${PURPLE[1]}, ${DEEP})` }}
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