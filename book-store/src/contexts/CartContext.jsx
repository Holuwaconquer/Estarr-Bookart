import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI, bookAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Normalize cart items to use consistent id field
  const normalizeItems = (items) => {
    return (items || []).map(item => {
      // Handle both direct book objects and backend responses
      const bookData = item.book || item;
      
      return {
        id: item.id || item.book?._id || bookData._id || item._id || bookData.id,
        _id: item._id || bookData._id || item.book?._id || bookData.id,
        book: item.book?._id || bookData._id || item.id || bookData.id,
        title: item.title || bookData.title || item.bookTitle || 'Unknown Title',
        author: item.author || bookData.author || item.bookAuthor || 'Unknown Author',
        price: item.price || bookData.price || 0,
        image: item.image || bookData.image || item.coverImage || bookData.coverImage,
        edition: item.edition || bookData.edition,
        description: item.description || bookData.description,
        category: item.category || bookData.category,
        discount: item.discount || bookData.discount,
        shippingCost: item.shippingCost || bookData.shippingCost || 0,
        features: item.features || bookData.features,
        quantity: item.quantity || item.qty || 1
      };
    });
  };

  // Load cart from backend on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        
        // Get all books to enrich cart items
        let allBooks = [];
        try {
          const booksResponse = await bookAPI.getAllBooks({ limit: 200 });
          allBooks = booksResponse.data?.books || booksResponse.data || [];
        } catch (error) {
          console.error('Failed to fetch books:', error);
        }

        let cartItems = [];
        
        if (token) {
          // Load from backend if authenticated
          const response = await cartAPI.getCart();
          cartItems = response.data.items || [];
        } else {
          // Load from localStorage if not authenticated
          const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
          cartItems = localCart;
        }

        // Enrich cart items with full product data
        const enrichedItems = cartItems.map(item => {
          const bookId = item.book || item._id || item.id;
          const fullBook = allBooks.find(b => b._id === bookId || b.id === bookId);
          
          return {
            id: bookId,
            _id: bookId,
            book: bookId,
            title: fullBook?.title || item.title || 'Unknown Title',
            author: fullBook?.author || item.author || 'Unknown Author',
            price: fullBook?.price !== undefined ? fullBook.price : (item.price || 0),
            image: fullBook?.image || item.image,
            coverImage: fullBook?.coverImage || item.coverImage,
            edition: fullBook?.edition || item.edition,
            description: fullBook?.description || item.description,
            category: fullBook?.category || item.category,
            discount: fullBook?.discount || item.discount,
            shippingCost: fullBook?.shippingCost || item.shippingCost || 0,
            features: fullBook?.features || item.features,
            quantity: item.quantity || item.qty || 1
          };
        });

        setCart(enrichedItems);
      } catch (error) {
        console.error('Failed to load cart:', error);
        // Fallback to localStorage
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(normalizeItems(localCart));
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  // Sync cart with backend when authenticated
  const syncCartWithBackend = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token || syncing) return;

    try {
      setSyncing(true);
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      if (localCart.length > 0) {
        // Merge local cart with server cart
        for (const item of localCart) {
          await cartAPI.addToCart(item.bookId || item.id, item.quantity || 1);
        }
        // Clear local storage after sync
        localStorage.removeItem('cart');
      }
      
      // Get updated cart from server
      const response = await cartAPI.getCart();
      setCart(response.data.items || []);
    } catch (error) {
      console.error('Failed to sync cart:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Add to cart with backend sync
  const addToCart = async (book, quantity = 1) => {
    try {
      const token = localStorage.getItem('accessToken');
      const bookId = book._id || book.id;
      const cartItem = {
        id: bookId,
        book: bookId,
        _id: bookId,
        title: book.title,
        author: book.author,
        price: book.price,
        image: book.image,
        quantity
      };

      if (token) {
        // Add to backend
        await cartAPI.addToCart(bookId, quantity);
        
        // Fetch all books to enrich response
        const booksResponse = await bookAPI.getAllBooks({ limit: 200 });
        const allBooks = booksResponse.data?.books || booksResponse.data || [];
        
        // Get cart and enrich
        const response = await cartAPI.getCart();
        const enrichedItems = (response.data.items || []).map(item => {
          const bid = item.book || item._id || item.id;
          const fullBook = allBooks.find(b => b._id === bid || b.id === bid);
          
          return {
            id: bid,
            _id: bid,
            book: bid,
            title: fullBook?.title || item.title || 'Unknown Title',
            author: fullBook?.author || item.author || 'Unknown Author',
            price: fullBook?.price !== undefined ? fullBook.price : (item.price || 0),
            image: fullBook?.image || item.image,
            edition: fullBook?.edition || item.edition,
            description: fullBook?.description || item.description,
            category: fullBook?.category || item.category,
            discount: fullBook?.discount || item.discount,
            shippingCost: fullBook?.shippingCost || item.shippingCost || 0,
            features: fullBook?.features || item.features,
            quantity: item.quantity || 1
          };
        });
        
        setCart(enrichedItems);
      } else {
        // Add to localStorage
        const updatedCart = [...cart];
        const existingItemIndex = updatedCart.findIndex(item => item.id === bookId);
        
        if (existingItemIndex > -1) {
          updatedCart[existingItemIndex].quantity += quantity;
        } else {
          updatedCart.push(cartItem);
        }
        
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }

      // Show success toast with animation
      toast.success(
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden">
            <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-semibold">Added to cart</p>
            <p className="text-sm text-gray-600">{book.title}</p>
          </div>
        </div>,
        {
          duration: 3000,
          position: 'bottom-right',
          style: {
            background: 'white',
            color: '#1f2937',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          },
        }
      );
    } catch (error) {
      toast.error('Failed to add item to cart');
      console.error('Add to cart error:', error);
    }
  };

  // Remove from cart
  const removeFromCart = async (itemId) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        console.log('🗑️ Removing item from cart:', itemId);
        
        await cartAPI.removeFromCart(itemId);
        
        // Fetch all books to enrich response (same as updateQuantity)
        const booksResponse = await bookAPI.getAllBooks({ limit: 200 });
        const allBooks = booksResponse.data?.books || booksResponse.data || [];
        
        // Get cart and enrich items with full product data
        const response = await cartAPI.getCart();
        console.log('📦 Cart after removal:', response.data.items);
        
        const enrichedItems = (response.data.items || []).map(item => {
          const bookId = item.book || item._id || item.id;
          const fullBook = allBooks.find(b => b._id === bookId || b.id === bookId);
          
          return {
            id: bookId,
            _id: bookId,
            book: bookId,
            title: fullBook?.title || item.title || 'Unknown Title',
            author: fullBook?.author || item.author || 'Unknown Author',
            price: fullBook?.price !== undefined ? fullBook.price : (item.price || 0),
            image: fullBook?.image || item.image,
            coverImage: fullBook?.coverImage || item.coverImage,
            edition: fullBook?.edition || item.edition,
            description: fullBook?.description || item.description,
            category: fullBook?.category || item.category,
            discount: fullBook?.discount || item.discount,
            shippingCost: fullBook?.shippingCost || item.shippingCost || 0,
            features: fullBook?.features || item.features,
            quantity: item.quantity || item.qty || 1
          };
        });
        
        console.log('✅ Enriched items after removal:', enrichedItems);
        setCart(enrichedItems);
      } else {
        // Offline mode - just filter from local state
        const updatedCart = cart.filter(item => item.id !== itemId && item._id !== itemId);
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
      
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
      console.error('❌ Remove from cart error:', error);
    }
  };

  // Update quantity
  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        await cartAPI.updateCartItem(itemId, quantity);
        
        // Fetch all books to enrich response
        const booksResponse = await bookAPI.getAllBooks({ limit: 200 });
        const allBooks = booksResponse.data?.books || booksResponse.data || [];
        
        // Get cart and enrich items
        const response = await cartAPI.getCart();
        const enrichedItems = (response.data.items || []).map(item => {
          const bookId = item.book || item._id || item.id;
          const fullBook = allBooks.find(b => b._id === bookId || b.id === bookId);
          
          return {
            id: bookId,
            _id: bookId,
            book: bookId,
            title: fullBook?.title || item.title || 'Unknown Title',
            author: fullBook?.author || item.author || 'Unknown Author',
            price: fullBook?.price !== undefined ? fullBook.price : (item.price || 0),
            image: fullBook?.image || item.image,
            edition: fullBook?.edition || item.edition,
            description: fullBook?.description || item.description,
            category: fullBook?.category || item.category,
            discount: fullBook?.discount || item.discount,
            shippingCost: fullBook?.shippingCost || item.shippingCost || 0,
            features: fullBook?.features || item.features,
            quantity: item.quantity || 1
          };
        });
        
        setCart(enrichedItems);
      } else {
        const updatedCart = cart.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        );
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
    } catch (error) {
      console.error('Update quantity error:', error);
      toast.error('Failed to update quantity');
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        await cartAPI.clearCart();
      } else {
        localStorage.removeItem('cart');
      }
      
      setCart([]);
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
      console.error('Clear cart error:', error);
    }
  };

  // Calculate totals
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  const value = {
    items: cart,
    cart,
    loading,
    syncing,
    totalItems,
    subtotal: subtotal.toFixed(2),
    shipping: shipping.toFixed(2),
    tax: tax.toFixed(2),
    total: total.toFixed(2),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    syncCartWithBackend,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};