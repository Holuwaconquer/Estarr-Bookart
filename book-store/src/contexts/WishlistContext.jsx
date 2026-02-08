import React, { createContext, useState, useContext, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    console.log('🚀 WishlistProvider: Loading from localStorage...');
    const savedWishlist = localStorage.getItem('wishlist');
    console.log('📦 Saved wishlist from localStorage:', savedWishlist);
    
    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist);
        console.log('✅ Parsed wishlist:', parsedWishlist);
        setWishlist(parsedWishlist);
      } catch (error) {
        console.error('❌ Error parsing wishlist from localStorage:', error);
        localStorage.removeItem('wishlist');
        setWishlist([]);
      }
    } else {
      console.log('📭 No wishlist found in localStorage');
      setWishlist([]);
    }
    setIsInitialized(true);
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return; // Don't save on initial load
    
    console.log('💾 Saving wishlist to localStorage:', wishlist);
    try {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      console.log('✅ Wishlist saved successfully to localStorage');
    } catch (error) {
      console.error('❌ Error saving wishlist to localStorage:', error);
    }
  }, [wishlist, isInitialized]);

  const addToWishlist = (book) => {
    if (!book || !book._id) {
      console.error('❌ Cannot add to wishlist: Invalid book object', book);
      return false;
    }
    
    console.log('❤️ Adding to wishlist:', book._id, book.title);
    
    setWishlist(prev => {
      // Check if book is already in wishlist
      const bookId = book._id || book.id;
      if (prev.some(item => item._id === bookId || item.id === bookId)) {
        console.log('📌 Book already in wishlist:', bookId);
        return prev; // Already in wishlist
      }
      
      // Add new book to wishlist
      const bookToAdd = {
        _id: bookId,
        id: bookId,
        title: book.title || 'Unknown Book',
        author: book.author || 'Unknown Author',
        price: book.price || 0,
        image: book.image || book.coverImage || '',
        originalPrice: book.originalPrice,
        discount: book.discount,
        edition: book.edition,
        features: book.features || [],
        stock: book.stock,
        rating: book.rating
      };
      
      console.log('✅ Added book to wishlist:', bookToAdd);
      const newWishlist = [...prev, bookToAdd];
      console.log('📊 New wishlist length:', newWishlist.length);
      return newWishlist;
    });
    return true;
  };

  const removeFromWishlist = (bookId) => {
    console.log('🗑️ Removing from wishlist:', bookId);
    setWishlist(prev => {
      const newWishlist = prev.filter(item => item._id !== bookId && item.id !== bookId);
      console.log('📊 Wishlist after removal length:', newWishlist.length);
      return newWishlist;
    });
  };

  const isInWishlist = (bookId) => {
    const isIn = wishlist.some(item => item._id === bookId || item.id === bookId);
    console.log(`🔍 isInWishlist check for ${bookId}:`, isIn);
    return isIn;
  };

  const clearWishlist = () => {
    console.log('🧹 Clearing wishlist');
    setWishlist([]);
    localStorage.removeItem('wishlist');
  };

  const getWishlistCount = () => {
    return wishlist.length;
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist,
      getWishlistCount,
      isInitialized // Export for debugging
    }}>
      {children}
    </WishlistContext.Provider>
  );
};