import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HiTrendingUp, HiShoppingCart, HiUsers, HiCash, HiEye, HiArrowUp, HiArrowDown } from 'react-icons/hi';
import toast from 'react-hot-toast';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalViews: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    monthlyRevenue: [],
    categoryRevenue: [],
    topProducts: [],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month'); // day, week, month, year

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Mock data - Replace with actual API call
      setAnalytics({
        totalRevenue: 2450000,
        totalOrders: 342,
        totalCustomers: 1250,
        totalViews: 45000,
        revenueGrowth: 12.5,
        orderGrowth: 8.3,
        monthlyRevenue: [
          { month: 'Jan', revenue: 1200000, orders: 45 },
          { month: 'Feb', revenue: 1450000, orders: 52 },
          { month: 'Mar', revenue: 1800000, orders: 68 },
          { month: 'Apr', revenue: 2100000, orders: 75 },
          { month: 'May', revenue: 2450000, orders: 82 },
        ],
        categoryRevenue: [
          { name: 'Fiction', value: 850000, percentage: 34 },
          { name: 'Non-Fiction', value: 620000, percentage: 25 },
          { name: 'Science', value: 480000, percentage: 20 },
          { name: 'History', value: 340000, percentage: 14 },
          { name: 'Biography', value: 160000, percentage: 7 },
        ],
        topProducts: [
          { id: 1, title: 'The Great Gatsby', sales: 245, revenue: 450000 },
          { id: 2, title: 'To Kill a Mockingbird', sales: 189, revenue: 380000 },
          { id: 3, title: '1984', sales: 156, revenue: 310000 },
          { id: 4, title: 'Pride and Prejudice', sales: 142, revenue: 280000 },
          { id: 5, title: 'The Catcher in the Rye', sales: 128, revenue: 250000 },
        ],
        recentOrders: [
          { id: 'ORD001', customer: 'John Doe', amount: 45000, status: 'Delivered', date: '2024-01-19' },
          { id: 'ORD002', customer: 'Jane Smith', amount: 62000, status: 'Shipped', date: '2024-01-18' },
          { id: 'ORD003', customer: 'Mike Johnson', amount: 38000, status: 'Processing', date: '2024-01-17' },
          { id: 'ORD004', customer: 'Sarah Williams', amount: 95000, status: 'Delivered', date: '2024-01-16' },
          { id: 'ORD005', customer: 'Tom Brown', amount: 52000, status: 'Pending', date: '2024-01-15' },
        ]
      });
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, change, trend }) => (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? <HiArrowUp /> : <HiArrowDown />}
          {Math.abs(trend)}%
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">
        {typeof value === 'number' && value > 1000 ? `₦${(value / 1000).toFixed(1)}k` : value}
      </p>
      <p className="text-xs text-gray-500 mt-2">{change}</p>
    </motion.div>
  );

  const COLORS = ['#3B82F6', '#06B6D4', '#8B5CF6', '#EC4899', '#F59E0B'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Track your store performance</p>
          </div>
          
          {/* Period Selector */}
          <div className="flex gap-2">
            {['day', 'week', 'month', 'year'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={HiCash}
            label="Total Revenue"
            value={analytics.totalRevenue}
            change="vs last period"
            trend={analytics.revenueGrowth}
          />
          <StatCard
            icon={HiShoppingCart}
            label="Total Orders"
            value={analytics.totalOrders}
            change="vs last period"
            trend={analytics.orderGrowth}
          />
          <StatCard
            icon={HiUsers}
            label="Customers"
            value={analytics.totalCustomers}
            change="New this month"
            trend={5.2}
          />
          <StatCard
            icon={HiEye}
            label="Page Views"
            value={analytics.totalViews}
            change="vs last period"
            trend={3.8}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-xl p-6 shadow-lg border border-gray-200"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <HiTrendingUp className="w-6 h-6 text-blue-600" />
              Revenue Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                  formatter={(value) => `₦${value.toLocaleString()}`}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} name="Revenue" />
                <Line type="monotone" dataKey="orders" stroke="#06B6D4" strokeWidth={2} dot={{ fill: '#06B6D4' }} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryRevenue}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.categoryRevenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Top Products & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Selling Products</h2>
            <div className="space-y-3">
              {analytics.topProducts.map((product, idx) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{product.title}</p>
                    <p className="text-sm text-gray-500">{product.sales} sales</p>
                  </div>
                  <span className="font-bold text-blue-600">₦{(product.revenue / 1000).toFixed(0)}k</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
            <div className="space-y-3">
              {analytics.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-500">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₦{order.amount.toLocaleString()}</p>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
