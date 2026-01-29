import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import { AuthContext } from '../AuthContext';
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

  const subtotal = items?.reduce((s, it) => {
    const price = Number(it.price) || 0;
    return s + (price * (it.quantity || 1));
  }, 0) || 0;
  const shippingFee = subtotal > 5000 ? 0 : 1499;
  const tax = subtotal * 0.075;
  const total = subtotal + shippingFee + tax;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-indigo-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition-colors group"
          >
            <HiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Continue Shopping</span>
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl">
              <HiShoppingCart className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Shopping Cart</h1>
              <p className="text-gray-400">Your premium book collection</p>
            </div>
          </div>
        </div>

        {items?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-12 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
              <HiShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Your cart is empty</h3>
            <p className="text-gray-400 mb-8">Add some premium books to your collection</p>
            <button
              onClick={() => navigate('/category')}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
            >
              Browse Premium Collection
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  Your Items <span className="text-cyan-400">({totalItems})</span>
                </h2>
                <button
                  onClick={clearCart}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition-all"
                >
                  <HiTrash className="w-4 h-4" />
                  Clear Cart
                </button>
              </div>

              <div className="space-y-4">
                {items?.map((item, index) => {
                  const itemKey = item._id || item.id || item.book || `cart-item-${index}`;
                  return (
                    <motion.div
                      key={itemKey}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-all group"
                    >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Book Image */}
                      <div className="md:w-1/4">
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-24 h-32 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg shadow-2xl transform rotate-2" />
                            </div>
                          )}
                          {item.edition && (
                            <div className="absolute top-3 left-3">
                              <span className="px-2 py-1 bg-gradient-to-r from-cyan-500/90 to-blue-500/90 text-white text-xs font-semibold rounded-full">
                                {item.edition}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Book Details */}
                      <div className="md:w-2/4 flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold mb-1">
                              {item.title || item.bookTitle || 'Unknown Title'}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              by {item.author || item.bookAuthor || 'Unknown Author'}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id || item._id)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <HiX className="w-5 h-5 text-gray-400 hover:text-red-400" />
                          </button>
                        </div>

                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                          {item.description || item.bookDescription || 'Premium collector edition'}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {item.features?.slice(0, 3).map((feature, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-white/5 text-gray-300 text-xs rounded-lg border border-gray-800"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-4">Quantity:</span>
                          <div className="flex items-center border border-gray-800 rounded-lg overflow-hidden">
                            <button
                              onClick={() => handleQuantityChange(item.id || item._id, -1)}
                              className="px-3 py-2 hover:bg-white/5 transition-colors"
                            >
                              <HiMinus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 border-x border-gray-800 min-w-[60px] text-center">
                              {item.quantity || 1}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id || item._id, 1)}
                              className="px-3 py-2 hover:bg-white/5 transition-colors"
                            >
                              <HiPlus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="md:w-1/4 text-right">
                        <div className="text-2xl font-bold text-cyan-400 mb-1">
                          ₦{(((Number(item.price) || 0) > 0 ? Number(item.price) : 0) * (item.quantity || 1)).toFixed(2)}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">
                          ₦{((Number(item.price) || 0) > 0 ? Number(item.price) : 0).toFixed(2)} each
                        </p>
                        {item.discount && (
                          <div className="inline-block px-3 py-1 bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 text-xs font-semibold rounded-full border border-red-500/30">
                            {item.discount}% OFF
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-6"
              >
                <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 mb-6">
                  <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                  <div className="space-y-4 pb-6 border-b border-gray-800/50 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="font-medium">₦{subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Shipping</span>
                      <span className="font-medium">
                        {shippingFee === 0 ? (
                          <span className="text-green-400 font-bold flex items-center gap-1">
                            <HiTruck className="w-4 h-4" />
                            FREE
                          </span>
                        ) : (
                          `₦${shippingFee.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    
                    {shippingFee > 0 && (
                      <p className="text-xs text-gray-500">
                        Free shipping on orders over ₦5,000
                      </p>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tax (7.5%)</span>
                      <span className="font-medium">₦{tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-8">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      ₦{total.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all mb-4 flex items-center justify-center gap-2"
                  >
                    <HiCreditCard className="w-5 h-5" />
                    Proceed to Checkout
                  </button>

                  <button
                    onClick={() => navigate('/category')}
                    className="w-full py-3 border-2 border-cyan-500/30 text-cyan-400 rounded-xl font-semibold hover:bg-cyan-500/10 transition-all"
                  >
                    Continue Shopping
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg">
                        <HiShieldCheck className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium">Secure Checkout</p>
                        <p className="text-xs text-gray-400">256-bit encryption</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg">
                        <HiTruck className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">Free Shipping</p>
                        <p className="text-xs text-gray-400">On orders over ₦5,000</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
                        <HiShieldCheck className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium">Authenticity Guarantee</p>
                        <p className="text-xs text-gray-400">All books certified authentic</p>
                      </div>
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