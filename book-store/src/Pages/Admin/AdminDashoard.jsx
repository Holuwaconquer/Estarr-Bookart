import React, { useState, useEffect } from 'react';
import { 
  HiUserGroup, 
  HiShoppingBag, 
  HiCurrencyDollar,
  HiTrendingUp,
  HiChartBar,
  HiCalendar,
  HiDownload,
  HiEye,
  HiPencil,
  HiPlus,
  HiCheckCircle,
  HiClock,
  HiExclamationCircle
} from 'react-icons/hi';
import { motion } from 'framer-motion';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { orderAPI, userAPI, bookAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('week');
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    pendingOrders: 0
  });
  const [recentOrdersData, setRecentOrdersData] = useState([]);
  const [topBooksData, setTopBooksData] = useState([]);
  const [loading, setLoading] = useState(true);

   const checkUserRole = () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('token');
    
    console.log('🔍 Checking user role for dashboard:');
    console.log('  - User:', user?.email);
    console.log('  - Role:', user?.role);
    console.log('  - Token exists:', !!token);
    
    if (!user || !token) {
      toast.error('Authentication required');
      window.location.href = '/admin/login';
      return false;
    }
    
    if (user.role !== 'admin') {
      toast.error('Admin access required');
      window.location.href = '/dashboard';
      return false;
    }
    
    return true;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders and books - handle errors individually
      const promises = [
        orderAPI.getAllOrders({ limit: 100 }).catch(err => {
          console.error('Failed to fetch orders:', err);
          return { data: { orders: [] } };
        }),
        bookAPI.getAllBooks({ limit: 100 }).catch(err => {
          console.error('Failed to fetch books:', err);
          return { data: { books: [] } };
        }),
        userAPI.getAllUsers({ limit: 100 }).catch(err => {
          console.error('Failed to fetch users:', err);
          return { data: { users: [] } };
        })
      ];

      const [ordersRes, booksRes, userRes] = await Promise.all(promises);

      console.log('📋 Dashboard data fetched:', { ordersRes, booksRes, userRes });

      const orders = ordersRes.data?.orders || ordersRes.orders || [];
      const books = booksRes.data?.books || booksRes.books || [];
      const allUsers = userRes.data?.users || userRes.users || [];

      console.log('✅ Parsed data:', { orders: orders.length, books: books.length, users: allUsers.length });

      // Calculate dashboard statistics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || order.amount || 0), 0);
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const pendingOrders = orders.filter(order => order.status === 'pending').length;

      console.log('📊 Dashboard statistics:', { totalOrders, totalRevenue, avgOrderValue, pendingOrders });

      // Update dashboard stats
      setDashboardStats({
        totalUsers: allUsers.length,
        totalOrders: totalOrders,
        totalRevenue: totalRevenue,
        avgOrderValue: avgOrderValue,
        pendingOrders: pendingOrders
      });

      // Process recent orders
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(order => ({
          id: order._id || order.id,
          customer: order.user?.name || order.user?.email || 'Unknown',
          date: new Date(order.createdAt).toLocaleDateString(),
          amount: `₦${order.total?.toLocaleString()}`,
          status: order.status || 'Pending'
        }));
      
      setRecentOrdersData(recentOrders);

      // Process top books (you'll need to adjust this based on your actual data)
      const topBooks = books
        .slice(0, 5)
        .map(book => ({
          name: book.title || 'Unknown Book',
          sales: book.salesCount || 0,
          revenue: `₦${((book.price || 0) * (book.salesCount || 0)).toLocaleString()}`,
          stock: book.stock || 0
        }));
      
      setTopBooksData(topBooks);

    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!checkUserRole()) {
      return;
    }
    
    // Proceed with data fetching
    fetchDashboardData();
  }, []);

  const stats = [
    { label: 'Total Users', value: (dashboardStats.totalUsers || 0).toLocaleString(), change: '+12.5%', icon: HiUserGroup, color: 'from-cyan-500 to-blue-500' },
    { label: 'Total Orders', value: (dashboardStats.totalOrders || 0).toLocaleString(), change: '+8.3%', icon: HiShoppingBag, color: 'from-green-500 to-emerald-500' },
    { label: 'Revenue', value: `₦${Math.round(dashboardStats.totalRevenue || 0).toLocaleString()}`, change: '+15.2%', icon: HiCurrencyDollar, color: 'from-purple-500 to-pink-500' },
    { label: 'Avg. Order', value: `₦${Math.round(dashboardStats.avgOrderValue || 0).toLocaleString()}`, change: '+3.7%', icon: HiTrendingUp, color: 'from-orange-500 to-amber-500' },
  ];

  // Recent orders
  const recentOrders = recentOrdersData;

  // Top products
  const topProducts = topBooksData;

  const getStatusColor = (status) => {
    const colors = {
      'Delivered': 'bg-green-100/20 text-green-400 border border-green-500/30',
      'Processing': 'bg-blue-100/20 text-blue-400 border border-blue-500/30',
      'Shipped': 'bg-cyan-100/20 text-cyan-400 border border-cyan-500/30',
      'Pending': 'bg-yellow-100/20 text-yellow-400 border border-yellow-500/30',
    };
    return colors[status] || 'bg-gray-100/20 text-gray-600 border border-gray-300/30';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Delivered': <HiCheckCircle className="w-4 h-4" />,
      'Shipped': <HiTrendingUp className="w-4 h-4" />,
      'Processing': <HiClock className="w-4 h-4" />,
      'Pending': <HiExclamationCircle className="w-4 h-4" />,
    };
    return icons[status] || null;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 md:left-0 md:z-40 md:bg-white md:border-r md:border-gray-200">
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        >
          <motion.div
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            exit={{ x: -100 }}
            className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-40"
            onClick={(e) => e.stopPropagation()}
          >
            <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
          </motion.div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        {/* Header */}
        <AdminHeader isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full"
                />
              </div>
            ) : (
              <>
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-12"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                      <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        Admin Dashboard
                      </h1>
                      <p className="text-gray-600 text-lg">Welcome back! Here's your store overview.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 bg-gray-200/50 border border-gray-300/50 rounded-lg px-4 py-2 backdrop-blur-sm">
                        <HiCalendar className="w-4 h-4 text-cyan-400" />
                        <select 
                          value={timeRange}
                          onChange={(e) => setTimeRange(e.target.value)}
                          className="bg-transparent border-none focus:ring-0 text-sm text-white"
                        >
                          <option value="week" className="bg-white">Last 7 days</option>
                          <option value="month" className="bg-white">Last 30 days</option>
                          <option value="quarter" className="bg-white">Last quarter</option>
                          <option value="year" className="bg-white">Last year</option>
                        </select>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-gray-200/50 border border-gray-300/50 rounded-lg hover:border-cyan-500/50 transition-all flex items-center gap-2 text-gray-700 hover:text-gray-900"
                      >
                        <HiDownload className="w-4 h-4" />
                        Export
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-xl border border-gray-200/50 rounded-xl p-6 shadow-lg hover:border-cyan-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-sm font-medium text-green-400 bg-green-500/20 px-2 py-1 rounded border border-green-500/30">
                          {stat.change}
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold mb-1 text-gray-900">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Recent Orders */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-xl border border-gray-200/50 rounded-xl p-6 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
                        <p className="text-sm text-gray-600">Latest customer transactions</p>
                      </div>
                      <HiShoppingBag className="w-6 h-6 text-cyan-400" />
                    </div>

                    <div className="space-y-3">
                      {recentOrders.map((order, idx) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="p-4 bg-gray-100 border border-gray-300/50 rounded-lg hover:border-cyan-500/30 transition-all flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                                <HiShoppingBag className="w-5 h-5 text-cyan-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-dark">{order.customer}</p>
                                <p className="text-xs text-gray-500">{order.id} • {order.date}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-dark mb-1">{order.amount}</p>
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      className="w-full mt-6 py-3 bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-400 rounded-lg font-semibold transition-all"
                    >
                      View All Orders
                    </motion.button>
                  </motion.div>

                  {/* Quick Stats */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
                  >
                    {/* Active Users */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-xl border border-gray-200/50 rounded-xl p-6 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Active Users</h3>
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                          <HiUserGroup className="w-5 h-5 text-cyan-400" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold mb-2">{dashboardStats.totalUsers}</p>
                      <p className="text-sm text-green-400">+5.2% from last week</p>
                    </div>

                    {/* Conversion Rate */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-xl border border-gray-200/50 rounded-xl p-6 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Conversion</h3>
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                          <HiTrendingUp className="w-5 h-5 text-purple-400" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold mb-2">3.24%</p>
                      <p className="text-sm text-green-400">+0.5% from last week</p>
                    </div>

                    {/* Pending Orders */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-xl border border-gray-200/50 rounded-xl p-6 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Pending Orders</h3>
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
                          <HiClock className="w-5 h-5 text-yellow-400" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold mb-2">{dashboardStats.pendingOrders}</p>
                      <p className="text-sm text-yellow-400">Need attention</p>
                    </div>
                  </motion.div>
                </div>

                {/* Top Products */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mt-8 bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-xl border border-gray-200/50 rounded-xl p-6 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Top Selling Books</h2>
                      <p className="text-sm text-gray-600">Your bestselling products</p>
                    </div>
                    <HiChartBar className="w-6 h-6 text-purple-400" />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-300/50">
                          <th className="text-left py-3 px-4 text-sm text-gray-700 font-medium">Product</th>
                          <th className="text-left py-3 px-4 text-sm text-gray-700 font-medium">Sales</th>
                          <th className="text-left py-3 px-4 text-sm text-gray-700 font-medium">Revenue</th>
                          <th className="text-left py-3 px-4 text-sm text-gray-700 font-medium">Stock</th>
                          <th className="text-left py-3 px-4 text-sm text-gray-700 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.map((product, idx) => (
                          <motion.tr
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="border-b border-gray-300/30 hover:bg-gray-200/30 transition-all"
                          >
                            <td className="py-4 px-4 text-gray-900 font-medium">{product.name}</td>
                            <td className="py-4 px-4 text-gray-700">{product.sales}</td>
                            <td className="py-4 px-4 text-green-400 font-semibold">{product.revenue}</td>
                            <td className="py-4 px-4">
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                product.stock > 10 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {product.stock} units
                              </span>
                            </td>
                            <td className="py-4 px-4 flex gap-2">
                              <motion.button whileHover={{ scale: 1.1 }} className="p-2 hover:bg-gray-700/50 rounded transition-colors text-cyan-400">
                                <HiEye className="w-4 h-4" />
                              </motion.button>
                              <motion.button whileHover={{ scale: 1.1 }} className="p-2 hover:bg-gray-700/50 rounded transition-colors text-blue-400">
                                <HiPencil className="w-4 h-4" />
                              </motion.button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
