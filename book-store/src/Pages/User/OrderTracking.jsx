import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { HiMapPin, HiClock, HiCheckCircle, HiTruck, HiArrowRight } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { orderAPI } from '../../services/api';
import { AuthContext } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';

const OrderTracking = () => {
  const navigate = useNavigate();
  const { authenticated } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [authenticated, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getUserOrders();
      setOrders(response.data?.orders || []);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatus = (status) => {
    const statuses = {
      pending: { icon: HiClock, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Pending' },
      confirmed: { icon: HiCheckCircle, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Confirmed' },
      shipped: { icon: HiTruck, color: 'text-purple-500', bg: 'bg-purple-50', label: 'Shipped' },
      delivered: { icon: HiCheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: 'Delivered' },
      cancelled: { icon: HiArrowRight, color: 'text-red-500', bg: 'bg-red-50', label: 'Cancelled' }
    };
    return statuses[status] || statuses.pending;
  };

  const OrderTimeline = ({ order }) => {
    const timeline = [
      { status: 'Order Placed', date: order.createdAt, icon: HiCheckCircle, completed: true },
      { status: 'Confirmed', date: order.confirmedAt, icon: HiCheckCircle, completed: !!order.confirmedAt },
      { status: 'Shipped', date: order.shippedAt, icon: HiTruck, completed: !!order.shippedAt },
      { status: 'Delivered', date: order.deliveredAt, icon: HiMapPin, completed: !!order.deliveredAt }
    ];

    return (
      <div className="space-y-6 py-6">
        {timeline.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`p-3 rounded-full ${item.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Icon className={`w-6 h-6 ${item.completed ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                {idx < timeline.length - 1 && (
                  <div className={`w-1 h-8 ${item.completed ? 'bg-green-200' : 'bg-gray-200'}`}></div>
                )}
              </div>
              <div className="pt-2">
                <p className={`font-semibold ${item.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                  {item.status}
                </p>
                {item.date && (
                  <p className="text-sm text-gray-500">
                    {new Date(item.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!authenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track your orders and view details</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <HiClock className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-600 mt-4">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <HiTruck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">No orders yet</p>
            <button
              onClick={() => navigate('/category')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders List */}
            <div className="lg:col-span-2 space-y-4">
              {orders.map((order, idx) => {
                const statusInfo = getOrderStatus(order.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedOrder?._id === order._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">Order #{order._id.slice(-8)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.bg}`}>
                        <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                        <span className={`text-sm font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Items: {order.items?.length || 0}</p>
                        <p className="font-semibold text-gray-900">
                          ₦{(order.totalAmount || 0).toLocaleString()}
                        </p>
                      </div>
                      <HiArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Order Details */}
            {selectedOrder && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl border border-gray-200 p-6 h-fit sticky top-24"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Details</h2>

                {/* Timeline */}
                <OrderTimeline order={selectedOrder} />

                {/* Items */}
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900 mb-3">Items</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.title} x{item.quantity}</span>
                        <span className="font-medium text-gray-900">₦{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Info */}
                {selectedOrder.shippingInfo && (
                  <div className="border-t mt-4 pt-4">
                    <p className="font-semibold text-gray-900 mb-2">Shipping To</p>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.shippingInfo.address}
                      <br />
                      {selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.state}
                    </p>
                  </div>
                )}

                {/* Total */}
                <div className="border-t mt-4 pt-4 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-blue-600">
                    ₦{(selectedOrder.totalAmount || 0).toLocaleString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-6">
                  <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    Contact Support
                  </button>
                  <button className="flex-1 py-2 border border-gray-300 hover:bg-gray-50 text-gray-900 rounded-lg font-medium transition-colors">
                    Reorder
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
