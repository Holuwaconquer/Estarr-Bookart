import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../AuthContext';
import { userAPI, cartAPI, bookAPI } from '../../../services/api';
import { motion } from 'framer-motion';
import { HiHeart, HiShoppingBag, HiTrash, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { user } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        // Get wishlist IDs from localStorage
        const response = await userAPI.getWishlist();
        const bookIds = response.data || [];
        
        // Fetch book details for each ID
        if (bookIds.length > 0) {
          const booksData = await Promise.all(
            bookIds.map(async (id) => {
              try {
                const book = await bookAPI.getBookById(id);
                return book.data || book;
              } catch (error) {
                return null;
              }
            })
          );
          setWishlist(booksData.filter(book => book !== null));
        } else {
          setWishlist([]);
        }
      } catch (error) {
        console.error('Failed to load wishlist:', error);
        toast.error('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const removeFromWishlist = async (bookId) => {
    try {
      await userAPI.removeFromWishlist(bookId);
      setWishlist(wishlist.filter(item => item._id !== bookId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const addToCart = async (book) => {
    try {
      await cartAPI.addToCart(book._id, 1);
      toast.success(`${book.title} added to cart`);
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <HiHeart className="w-8 h-8 text-red-500" />
            My Wishlist
          </h1>
          <p className="text-gray-600">Save your favorite books for later</p>
        </motion.div>

        {/* Wishlist Items */}
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((book) => (
              <motion.div
                key={book._id}
                variants={itemVariants}
                whileHover={{ y: -8, shadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                className="bg-white rounded-xl shadow-lg overflow-hidden group"
              >
                {/* Image Container */}
                <div className="relative h-64 bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">📚</span>
                    </div>
                  )}

                  {/* Wishlist Badge */}
                  <div className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg">
                    <HiHeart className="w-6 h-6 text-red-500 fill-current" />
                  </div>

                  {/* Stock Status */}
                  <div
                    className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${
                      book.stock > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {book.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {book.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-2">
                    {book.author?.name || 'Unknown Author'}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-yellow-400">
                      {'⭐'.repeat(Math.floor(book.rating || 0))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({book.reviews?.length || 0} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-purple-600">
                      NGN {book.price?.toLocaleString()}
                    </p>
                    {book.originalPrice && book.originalPrice > book.price && (
                      <p className="text-sm text-gray-500 line-through">
                        NGN {book.originalPrice?.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addToCart(book)}
                      disabled={book.stock === 0}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <HiShoppingBag className="w-4 h-4" />
                      Add to Cart
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => removeFromWishlist(book._id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                    >
                      <HiTrash className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={itemVariants}
            className="text-center py-16 bg-white rounded-xl shadow-lg"
          >
            <HiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">Your wishlist is empty</p>
            <p className="text-gray-500 mb-6">Add books to your wishlist to save them for later</p>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              href="/shop"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Browse Books
            </motion.a>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Wishlist;
