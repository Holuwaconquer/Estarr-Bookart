import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import { AuthContext } from '../AuthContext.jsx';
import { 
  HiTrash, 
  HiArrowLeft, 
  HiShoppingCart,
  HiTruck,
  HiShieldCheck,
  HiCreditCard,
  HiX,
  HiPlus,
  HiMinus
} from 'react-icons/hi';
import { motion } from 'framer-motion';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, clearCart, totalItems, updateQuantity } = useCart();
  const { authenticated } = useContext(AuthContext);

  useEffect(() => {
    document.title = 'Shopping Cart | EStarr Bookart Hub';
    window.scrollTo(0, 0);
  }, [])
  
  useEffect(() => {
    if (items && items.length > 0) {
      console.log('📦 Cart items updated:', items.map(item => ({
        id: item.id,
        title: item.title,
        author: item.author,
        price: item.price,
        quantity: item.quantity,
        hasImage: !!item.image
      })));
    } else {
      console.log('📦 Cart is empty');
    }
  }, [items]);

  const getDiscountedPrice = (item) => {
    const price = Number(item.price) || 0;
    const discount = Number(item.discount) || 0;
    const finalPrice = Number(item.finalPrice) || 0;
    
    if (finalPrice > 0 && finalPrice < price) {
      return finalPrice;
    } else if (discount > 0) {
      return price * (1 - discount / 100);
    }
    return price;
  };

  const getItemTotal = (item) => {
    const discountedPrice = getDiscountedPrice(item);
    const quantity = item.quantity || 1;
    return discountedPrice * quantity;
  };

  const subtotal = items?.reduce((s, item) => {
    return s + getItemTotal(item);
  }, 0) || 0;

  const shippingFee = items && items.length > 0 
    ? Math.max(...items.map(item => Number(item.shippingCost) || 0), 0)
    : 0;
  
  const total = subtotal + shippingFee;

  const totalSavings = items?.reduce((savings, item) => {
    const originalPrice = Number(item.price) || 0;
    const discountedPrice = getDiscountedPrice(item);
    const quantity = item.quantity || 1;
    if (originalPrice > discountedPrice) {
      return savings + ((originalPrice - discountedPrice) * quantity);
    }
    return savings;
  }, 0) || 0;

  const handleCheckout = () => {
    if (!authenticated) {
      navigate('/login', { state: { returnTo: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };

  const handleQuantityChange = (id, delta) => {
    const item = items.find(it => it.id === id || it._id === id);
    if (item) {
      const newQuantity = (item.quantity || 1) + delta;
      if (newQuantity >= 1) {
        updateQuantity(id, newQuantity);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header - Compact for mobile */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm transition-colors"
          >
            <HiArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HiShoppingCart className="w-6 h-6 text-gray-700" />
              <h1 className="text-2xl font-bold text-gray-900">Cart</h1>
              <span className="text-sm text-gray-500">({totalItems} items)</span>
            </div>
            
            {items?.length > 0 && (
              <button
                onClick={clearCart}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <HiTrash className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {items?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <HiShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Add some books to your collection</p>
            <button
              onClick={() => navigate('/category')}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Browse Collection
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items - Compact List View for Mobile */}
            <div className="lg:col-span-2 space-y-3">
              {items?.map((item, index) => {
                const itemKey = item._id || item.id || item.book || `cart-item-${index}`;
                const originalPrice = Number(item.price) || 0;
                const discountedPrice = getDiscountedPrice(item);
                const isDiscounted = originalPrice > discountedPrice;
                
                return (
                  <motion.div
                    key={itemKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex p-3 sm:p-4 gap-3 sm:gap-4">
                      {/* Book Image - Small thumbnail */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-full sm:w-20 sm:h-28 rounded-md overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                          )}
                          {isDiscounted && (
                            <div className="absolute mt-1 ml-1">
                              <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                                {item.discount}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Book Details - Compact */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                              {item.title || item.bookTitle || 'Unknown Title'}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">
                              {item.author || item.bookAuthor || 'Unknown Author'}
                            </p>
                            
                            {/* Price Section - Compact */}
                            <div className="mt-1 sm:mt-2">
                              {isDiscounted ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-base sm:text-lg font-bold text-gray-900">
                                    ₦{getItemTotal(item).toLocaleString()}
                                  </span>
                                  <span className="text-xs text-gray-400 line-through">
                                    ₦{(originalPrice * (item.quantity || 1)).toLocaleString()}
                                  </span>
                                  <span className="text-xs text-green-600">
                                    Save ₦{((originalPrice - discountedPrice) * (item.quantity || 1)).toLocaleString()}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-base sm:text-lg font-bold text-gray-900">
                                  ₦{getItemTotal(item).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id || item._id)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                          >
                            <HiX className="w-4 h-4 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>

                        {/* Quantity Controls - Compact */}
                        <div className="flex items-center justify-between mt-2 sm:mt-3">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => handleQuantityChange(item.id || item._id, -1)}
                              className="px-2 py-1 hover:bg-gray-50 transition-colors"
                            >
                              <HiMinus className="w-3 h-3 text-gray-600" />
                            </button>
                            <span className="px-3 py-1 text-sm text-gray-900 min-w-[40px] text-center">
                              {item.quantity || 1}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id || item._id, 1)}
                              className="px-2 py-1 hover:bg-gray-50 transition-colors"
                            >
                              <HiPlus className="w-3 h-3 text-gray-600" />
                            </button>
                          </div>
                          
                          {/* Price per item - Small */}
                          <p className="text-xs text-gray-500">
                            ₦{discountedPrice.toLocaleString()} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Order Summary - Sticky */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-6"
              >
                <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
                  <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                    Order Summary
                  </h2>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">₦{subtotal.toLocaleString()}</span>
                    </div>
                    
                    {totalSavings > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discounts</span>
                        <span className="font-medium text-green-600">
                          -₦{totalSavings.toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    {/* <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-gray-900">
                        {shippingFee === 0 ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          `₦${shippingFee.toLocaleString()}`
                        )}
                      </span>
                    </div> */}
                  </div>

                  <div className="border-t border-gray-300 pt-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-gray-900">
                        ₦{total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {totalSavings > 0 && (
                    <div className="mb-4 p-2 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-700 font-medium">You saved</span>
                        <span className="text-green-700 font-bold">
                          ₦{totalSavings.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors mb-3"
                  >
                    Checkout
                  </button>

                  <button
                    onClick={() => navigate('/category')}
                    className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>

                {/* Trust Badges - Simplified */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <HiShieldCheck className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Secure</p>
                    </div>
                    
                    <div className="text-center">
                      <HiTruck className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Free Shipping</p>
                    </div>
                    
                    <div className="text-center">
                      <HiShieldCheck className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Authentic</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;