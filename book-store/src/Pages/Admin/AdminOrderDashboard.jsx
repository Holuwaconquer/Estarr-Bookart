import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiEye,
  HiCheck,
  HiExclamationCircle,
  HiClock,
  HiTruck,
  HiCheckCircle,
  HiSearchCircle,
  HiFilter,
  HiDownload
} from 'react-icons/hi';
import { orderAPI } from '../../services/api';
import toast from 'react-hot-toast';
import DashboardLayout from '../../layouts/DashboardLayouts';

const AdminOrderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAllOrders();
      setOrders(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdating(true);
      await orderAPI.updateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update order status');
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = 
      order._id.includes(searchTerm) ||
      order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <HiClock className="w-4 h-4" />;
      case 'confirmed': return <HiCheck className="w-4 h-4" />;
      case 'shipped': return <HiTruck className="w-4 h-4" />;
      case 'delivered': return <HiCheckCircle className="w-4 h-4" />;
      default: return <HiExclamationCircle className="w-4 h-4" />;
    }
  };

  const stats = [
    { label: 'Total Orders', value: orders.length, color: 'purple' },
    { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: 'yellow' },
    { label: 'Shipped', value: orders.filter(o => o.status === 'shipped').length, color: 'blue' },
    { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: 'green' }
  ];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600">Manage and track all customer orders</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${stat.color}-500`}
            >
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <HiSearchCircle className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order ID, Email, or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div className="flex gap-2">
              <HiFilter className="w-5 h-5 text-gray-400 self-center" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              <HiDownload className="w-5 h-5 inline mr-2" />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Orders Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-gray-600 mt-4">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow-md p-12 text-center"
          >
            <HiSearchCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No orders found</p>
          </motion.div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <AnimatePresence>
                    {filteredOrders.map((order, index) => (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-mono text-gray-900">{order._id.slice(-8)}</td>
                        <td className="px-6 py-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-900">{order.shippingAddress?.fullName}</p>
                            <p className="text-gray-600">{order.userEmail}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-purple-600">
                          NGN {order.totalAmount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium w-fit ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
                          >
                            <HiEye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto"
            >
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-mono font-bold text-gray-900">{selectedOrder._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-lg font-bold text-purple-600">NGN {selectedOrder.totalAmount?.toLocaleString()}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">Customer</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p><strong>{selectedOrder.shippingAddress?.fullName}</strong></p>
                    <p className="text-sm text-gray-600">{selectedOrder.userEmail}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.shippingAddress?.phone}</p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">Shipping Address</p>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <p>{selectedOrder.shippingAddress?.address}</p>
                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                        <span className="text-gray-700">{item.title} x{item.quantity}</span>
                        <span className="font-medium">NGN {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">Update Status</p>
                  <div className="flex gap-2 flex-wrap">
                    {statusOptions.slice(1).map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleStatusUpdate(selectedOrder._id, option.value)}
                        disabled={updating || option.value === selectedOrder.status}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          option.value === selectedOrder.status
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        } disabled:opacity-50`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default AdminOrderDashboard;
