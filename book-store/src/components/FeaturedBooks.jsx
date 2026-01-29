import React, { useRef, useEffect, useState } from 'react';
import BookCard from './BookCard';
import { HiChevronLeft, HiChevronRight, HiSparkles, HiFire } from 'react-icons/hi';
import { bookAPI } from '../services/api';
import { motion } from 'framer-motion';

const FeaturedBooks = () => {
  const scrollRef = useRef(null);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        setLoading(true);
        const response = await bookAPI.getAllBooks({ limit: 8, featured: true });
        if (response && response.data) {
          setFeatured(response.data);
        } else {
          setFeatured([]);
          setError('No books available');
        }
      } catch (err) {
        console.error('Failed to fetch featured books:', err);
        setFeatured([]);
        setError('Failed to load books');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBooks();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-950 via-blue-950 to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Curated Collection
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl">
            Handpicked premium books and limited editions from our exclusive collection
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-transparent border-t-cyan-500 border-r-blue-500 rounded-full animate-spin-slow" />
              <div className="absolute inset-0 flex items-center justify-center">
                <HiSparkles className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
              <HiFire className="w-8 h-8 text-amber-400" />
            </div>
            <p className="text-amber-400 font-medium text-lg mb-2">{error}</p>
            <p className="text-gray-400">Check back soon for more amazing books!</p>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && featured.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
              <HiSparkles className="w-8 h-8 text-cyan-400" />
            </div>
            <p className="text-cyan-400 font-medium text-lg mb-2">Collection Coming Soon</p>
            <p className="text-gray-400">Our premium collection is being curated. Stay tuned!</p>
          </motion.div>
        )}

        {/* Books Display */}
        {!loading && featured.length > 0 && (
          <>
            <div className="relative mb-8">
              {/* Navigation Controls */}
              <div className="absolute -top-16 right-0 z-10 flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scroll('left')}
                  className="p-3 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-cyan-500/30 transition-all backdrop-blur-sm"
                >
                  <HiChevronLeft className="w-5 h-5 text-gray-300 hover:text-cyan-400 transition-colors" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scroll('right')}
                  className="p-3 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-cyan-500/30 transition-all backdrop-blur-sm"
                >
                  <HiChevronRight className="w-5 h-5 text-gray-300 hover:text-cyan-400 transition-colors" />
                </motion.button>
              </div>

              {/* Books Container */}
              <div className="relative">
                <div
                  ref={scrollRef}
                  className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x snap-mandatory"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {featured.map((book, index) => (
                    <motion.div
                      key={book._id || book.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex-none w-72 lg:w-80 snap-start"
                    >
                      <BookCard book={book} />
                    </motion.div>
                  ))}
                </div>
                
                {/* Gradient Overlay */}
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-950 via-gray-950/80 to-transparent pointer-events-none" />
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent pointer-events-none" />
              </div>
            </div>

            {/* View All */}
            <div className="text-center mt-12">
              <motion.a
                href="/category"
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl font-semibold hover:bg-cyan-500/30 transition-all group"
              >
                Browse All Collections
                <HiChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedBooks;