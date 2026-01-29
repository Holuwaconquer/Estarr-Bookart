import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiSearch, HiFilter, HiPencil, HiEye, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { orderAPI } from '../../services/api';

const AdminOrders = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    shipped: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await orderAPI.getAllOrders({ 
          page, 
          limit: 20,
          status: statusFilter || undefined
        });
        setOrders(response.data?.orders || []);
        setTotalPages(response.data?.pagination?.pages || 1);
      } catch (error) {
        toast.error('Failed to fetch orders');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      await orderAPI.updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated');
      
      // Update local state
      setOrders(orders.map(o => 
        o._id === orderId ? { ...o, status: newStatus } : o
      ));
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  return (
    <div className="flex h-screen bg-gray-950">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-950 via-blue-950 to-indigo-950">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Orders
                  </h1>
                  <p className="text-gray-400">Manage customer orders</p>
                </div>
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 flex flex-col sm:flex-row gap-4"
            >
              <div className="flex-1 relative">
                <HiSearch className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search order ID..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-800/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-6 py-3 bg-gray-900/50 border border-gray-800/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
              >
                <option value="">All Statuses</option>
                {statusOptions.map(status => (
                  <option key={status} value={status} className="capitalize">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-800/50 rounded-xl overflow-hidden shadow-lg"
            >
              {loading ? (
                <div className="p-8 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto"
                  />
                </div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  No orders found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700/50 bg-gray-900/50">
                        <th className="px-6 py-4 text-left text-sm text-gray-400 font-medium">Order ID</th>
                        <th className="px-6 py-4 text-left text-sm text-gray-400 font-medium">Customer</th>
                        <th className="px-6 py-4 text-left text-sm text-gray-400 font-medium">Total</th>
                        <th className="px-6 py-4 text-left text-sm text-gray-400 font-medium">Status</th>
                        <th className="px-6 py-4 text-left text-sm text-gray-400 font-medium">Date</th>
                        <th className="px-6 py-4 text-center text-sm text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <motion.tr
                          key={order._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-all"
                        >
                          <td className="px-6 py-4">
                            <p className="text-white font-medium font-mono text-sm">{order._id.slice(-8)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-white">{order.user?.name}</p>
                              <p className="text-xs text-gray-500">{order.user?.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-cyan-400 font-semibold">₦{order.total?.toLocaleString()}</p>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              disabled={updatingStatus === order._id}
                              className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[order.status]} bg-transparent focus:outline-none cursor-pointer`}
                            >
                              {statusOptions.map(status => (
                                <option key={status} value={status} className="bg-gray-900">
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleViewDetails(order)}
                              className="p-2 hover:bg-blue-500/20 rounded transition-colors text-blue-400"
                            >
                              <HiEye className="w-4 h-4" />
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <motion.button
                    key={p}
                    onClick={() => setPage(p)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      page === p
                        ? 'bg-cyan-500/50 text-white border border-cyan-500'
                        : 'bg-gray-900/50 text-gray-400 border border-gray-800/50 hover:border-cyan-500/50'
                    }`}
                  >
                    {p}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/95">
              <h2 className="text-2xl font-bold text-white">Order Details</h2>
              <motion.button
                onClick={() => setShowDetails(false)}
                whileHover={{ scale: 1.1 }}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <HiX className="w-6 h-6 text-gray-400" />
              </motion.button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Order ID</p>
                  <p className="text-white font-mono">{selectedOrder._id}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Date</p>
                  <p className="text-white">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Customer</h3>
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                  <p className="text-white">{selectedOrder.user?.name}</p>
                  <p className="text-gray-400">{selectedOrder.user?.email}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="bg-gray-800/50 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">{item.title}</p>
                        <p className="text-gray-400 text-sm">x{item.quantity}</p>
                      </div>
                      <p className="text-cyan-400 font-semibold">₦{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>₦{selectedOrder.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span>₦{selectedOrder.shippingFee?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tax</span>
                  <span>₦{selectedOrder.tax?.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-700 pt-2 flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span>₦{selectedOrder.total?.toLocaleString()}</span>
                </div>
              </div>

              {/* Close Button */}
              <motion.button
                onClick={() => setShowDetails(false)}
                whileHover={{ scale: 1.05 }}
                className="w-full px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold transition-all"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
