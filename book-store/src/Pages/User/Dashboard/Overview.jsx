import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../AuthContext';
import { orderAPI } from '../../../services/api';
import { motion } from 'framer-motion';
import { 
  HiShoppingBag, HiHeart, HiStar, HiArrowRight, HiBookOpen, 
  HiCloudDownload, HiCalendar, HiCurrencyDollar, HiCheckCircle 
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const Overview = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    wishlistItems: 0,
    accountAge: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const ordersResponse = await orderAPI.getMyOrders();
        const orders = ordersResponse.data || [];
        
        const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const accountAge = user?.createdAt 
          ? Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) 
          : 0;

        setStats({
          totalOrders: orders.length,
          totalSpent: totalSpent,
          wishlistItems: user?.wishlist?.length || 0,
          accountAge: accountAge
        });

        setRecentOrders(orders.slice(0, 3));
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Background */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-white py-8 px-4 sm:px-6 lg:px-8 rounded-xl mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-blue-100 text-lg">Here's your dashboard overview</p>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {/* Total Orders */}
        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalOrders}</p>
              <p className="text-xs text-slate-500 mt-2">{stats.totalOrders > 0 ? '✓ Active' : 'No orders yet'}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <HiShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        {/* Total Spent */}
        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">Total Spent</p>
              <p className="text-3xl font-bold text-slate-900">₦{(stats.totalSpent / 1000).toFixed(1)}K</p>
              <p className="text-xs text-slate-500 mt-2">{stats.totalSpent > 0 ? '✓ Verified' : 'No spending'}</p>
            </div>
            <div className="bg-cyan-100 p-3 rounded-lg">
              <HiCurrencyDollar className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </motion.div>

        {/* Wishlist Items */}
        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">Wishlist Items</p>
              <p className="text-3xl font-bold text-slate-900">{stats.wishlistItems}</p>
              <p className="text-xs text-slate-500 mt-2">Books saved</p>
            </div>
            <div className="bg-rose-100 p-3 rounded-lg">
              <HiHeart className="w-6 h-6 text-rose-600" />
            </div>
          </div>
        </motion.div>

        {/* Account Age */}
        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">Member Since</p>
              <p className="text-3xl font-bold text-slate-900">{stats.accountAge}d</p>
              <p className="text-xs text-slate-500 mt-2">Days active</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <HiCalendar className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <HiShoppingBag className="w-6 h-6" />
              Recent Orders
            </h2>
          </div>

          <div className="p-6">
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order, idx) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                          <HiCheckCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            Order #{order._id?.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-sm text-slate-600">
                            {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">₦{order.totalAmount?.toLocaleString()}</p>
                        <span className="text-xs font-medium px-3 py-1 rounded-full inline-block mt-1 bg-green-100 text-green-800">
                          {order.status?.charAt(0).toUpperCase() + (order.status?.slice(1) || 'Pending')}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <motion.a
                  whileHover={{ x: 5 }}
                  href="/dashboard/orders"
                  className="mt-6 inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
                >
                  View all orders <HiArrowRight className="w-4 h-4" />
                </motion.a>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiShoppingBag className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium mb-2">No orders yet</p>
                <p className="text-slate-500 text-sm mb-6">Start your shopping journey today</p>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  href="/shop"
                  className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Start Shopping
                </motion.a>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          {/* Wishlist Action */}
          <motion.a
            whileHover={{ scale: 1.02, y: -2 }}
            href="/dashboard/wishlist"
            className="block p-5 bg-white border border-slate-200 rounded-xl hover:border-rose-300 hover:bg-rose-50/50 transition-all shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                <HiHeart className="w-6 h-6 text-rose-600" />
              </div>
              <span className="font-semibold text-slate-900">My Wishlist</span>
            </div>
            <p className="text-sm text-slate-600 ml-13">{stats.wishlistItems} items saved</p>
          </motion.a>

          {/* Settings Action */}
          <motion.a
            whileHover={{ scale: 1.02, y: -2 }}
            href="/dashboard/settings"
            className="block p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                ⚙️
              </div>
              <span className="font-semibold text-slate-900">Settings</span>
            </div>
            <p className="text-sm text-slate-600 ml-13">Update your profile</p>
          </motion.a>

          {/* Browse Books Action */}
          <motion.a
            whileHover={{ scale: 1.02, y: -2 }}
            href="/shop"
            className="block p-5 bg-white border border-slate-200 rounded-xl hover:border-cyan-300 hover:bg-cyan-50/50 transition-all shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <HiBookOpen className="w-6 h-6 text-cyan-600" />
              </div>
              <span className="font-semibold text-slate-900">Browse Books</span>
            </div>
            <p className="text-sm text-slate-600 ml-13">Explore new collection</p>
          </motion.a>

          {/* Download Invoice */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            onClick={() => {
              toast.success('Download feature coming soon!');
            }}
            className="w-full p-5 bg-white border border-slate-200 rounded-xl hover:border-green-300 hover:bg-green-50/50 transition-all shadow-sm text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <HiCloudDownload className="w-6 h-6 text-green-600" />
              </div>
              <span className="font-semibold text-slate-900">Download Invoice</span>
            </div>
            <p className="text-sm text-slate-600 ml-13">Get receipts & invoices</p>
          </motion.button>
        </motion.div>
      </div>

      {/* Recommendations Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 rounded-xl p-8 text-white shadow-lg border border-blue-400/50"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <HiStar className="w-8 h-8 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Recommended For You</h3>
              <p className="text-blue-100 text-sm">Based on your reading history</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2 flex-shrink-0"
          >
            Explore <HiArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Overview;
