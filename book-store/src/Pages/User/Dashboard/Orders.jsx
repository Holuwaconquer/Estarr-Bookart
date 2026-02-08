import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../AuthContext';
import { orderAPI } from '../../../services/api';
import { motion } from 'framer-motion';
import { HiTruck, HiCheckCircle, HiClock, HiExclamationCircle, HiChevronDown } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await orderAPI.getMyOrders();
        setOrders(response.data || []);
      } catch (error) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'delivered': 'bg-green-100 text-green-800',
      'shipped': 'bg-blue-100 text-blue-800',
      'processing': 'bg-yellow-100 text-yellow-800',
      'received': 'bg-purple-100 text-purple-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'delivered': <HiCheckCircle className="w-5 h-5" />,
      'shipped': <HiTruck className="w-5 h-5" />,
      'processing': <HiClock className="w-5 h-5" />,
      'received': <HiClock className="w-5 h-5" />,
      'cancelled': <HiExclamationCircle className="w-5 h-5" />
    };
    return icons[status?.toLowerCase()] || <HiClock className="w-5 h-5" />;
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
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your purchases</p>
        </motion.div>

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order, idx) => (
              <motion.div
                key={order._id}
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div
                  onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                  className="p-6 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Order #{order._id?.slice(-6).toUpperCase()}</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          NGN {order.total?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>📅 {new Date(order.createdAt).toLocaleDateString()}</span>
                      <span>📦 {order.items?.length || 0} items</span>
                      <span className={`px-3 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
                        {order.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedOrder === order._id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <HiChevronDown className="w-6 h-6 text-gray-400" />
                  </motion.div>
                </div>

                {/* Expanded Details */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: expandedOrder === order._id ? 'auto' : 0,
                    opacity: expandedOrder === order._id ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden border-t border-gray-200"
                >
                  <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 space-y-4">
                    {/* Items */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                      <div className="space-y-2">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {item.book?.title || 'Book'} x{item.quantity}
                            </span>
                            <span className="font-medium">NGN {(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary Breakdown */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-700">
                          <span>Subtotal</span>
                          <span>NGN {order.subtotal?.toLocaleString() || '0'}</span>
                        </div>
                        {order.shippingFee > 0 && (
                          <div className="flex justify-between text-gray-700">
                            <span>Shipping Fee</span>
                            <span>NGN {order.shippingFee?.toLocaleString() || '0'}</span>
                          </div>
                        )}
                        {order.tax > 0 && (
                          <div className="flex justify-between text-gray-700">
                            <span>Tax</span>
                            <span>NGN {order.tax?.toLocaleString() || '0'}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-300">
                          <span>Total</span>
                          <span>NGN {order.total?.toLocaleString() || '0'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress?.street || 'N/A'}<br />
                        {order.shippingAddress?.city}, {order.shippingAddress?.state}
                      </p>
                    </div>

                    {/* Order Status Timeline */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Status Timeline</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex gap-3">
                          <HiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900">Order Confirmed</p>
                            <p className="text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        {order.status !== 'cancelled' && (
                          <div className="flex gap-3">
                            <HiTruck className={`w-5 h-5 flex-shrink-0 mt-0.5 ${order.status === 'shipped' || order.status === 'delivered' ? 'text-blue-600' : 'text-gray-400'}`} />
                            <div>
                              <p className={`font-medium ${order.status === 'shipped' || order.status === 'delivered' ? 'text-gray-900' : 'text-gray-600'}`}>
                                Out for Delivery
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-gray-200 flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                      >
                        Track Order
                      </motion.button>
                      {order.status === 'delivered' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                        >
                          Leave Review
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={itemVariants}
            className="text-center py-16 bg-white rounded-xl shadow-lg"
          >
            <HiTruck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">No orders yet</p>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              href="/category"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Start Shopping
            </motion.a>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Orders;
