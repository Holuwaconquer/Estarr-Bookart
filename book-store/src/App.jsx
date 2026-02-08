import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiHome, HiArrowLeft, HiSparkles } from 'react-icons/hi'
import Home from './Pages/Home'
import Landingpage from './Pages/Landingpage'
import Cart from './Pages/Cart'
import Checkout from './Pages/Checkout'
import CategoryPage from './Pages/CategoryPage'
import ProductDetail from './Pages/ProductDetail'
import BlogPage from './Pages/BlogPage'
import BlogDetail from './Pages/BlogDetail'

// User Pages
import UserLogin from './Pages/User/UserLogin'
import UserSignup from './Pages/User/UserSignup'
import ForgotPassword from './Pages/User/ForgotPassword'
import ResetPassword from './Pages/User/ResetPassword'
import PasswordReset from './Pages/User/PasswordReset'

// Dashboard Layout
import DashboardLayout from './layouts/DashboardLayouts'
import Overview from './Pages/User/Dashboard/Overview'
import Profile from './Pages/User/Dashboard/Profile'
import Orders from './Pages/User/Dashboard/Orders'
import Wishlist from './Pages/User/Dashboard/Wishlist'
import Settings from './Pages/User/Dashboard/Settings'

// Admin Pages
import AdminLogin from './Pages/Admin/AdminLogin'
import AdminDashboard from './Pages/Admin/AdminDashoard'
import AdminProducts from './Pages/Admin/AdminProducts'
import AdminCategories from './Pages/Admin/AdminCategories'
import AdminFlashSales from './Pages/Admin/AdminFlashSales'
import AdminOrders from './Pages/Admin/AdminOrders'
import AdminBlog from './Pages/Admin/AdminBlog'
import AdminBankAccounts from './Pages/Admin/AdminBankAccounts'
import AdminUsers from './Pages/Admin/AdminUsers'
import ProtectedRoute from './components/ProtectedRoute'
import ProtectedRouteForAuth from './components/ProtectedRouteForAuth'
import AdminRoute from './components/AdminRoute'
import UserRoleChecker from './components/UserRoleChecker'

const App = () => {
  const ADMIN_ROUTE = import.meta.env.VITE_ADMIN_ROUTE || 'admin'

  return (
    <Routes>
      {/* Main Layout */}
      <Route path='/' element={<Home />}>
        <Route index element={<Landingpage />} />
        <Route path='cart' element={<Cart />} />
        <Route path='checkout' element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path='category' element={<CategoryPage />} />
        <Route path='category/:category' element={<CategoryPage />} />
        <Route path='product/:id' element={<ProductDetail />} />
        <Route path='blog' element={<BlogPage />} />
        <Route path='blog/:slug' element={<BlogDetail />} />
        <Route path='blog/post/:id' element={<BlogDetail />} />
      </Route>

      {/* Authentication - Only for unauthenticated users */}
      <Route path='/login' element={<ProtectedRouteForAuth><UserLogin /></ProtectedRouteForAuth>} />
      <Route path='/register' element={<ProtectedRouteForAuth><UserSignup /></ProtectedRouteForAuth>} />
      <Route path='/account/forgot-password' element={<ProtectedRouteForAuth><ForgotPassword /></ProtectedRouteForAuth>} />
      <Route path='/account/verify-code' element={<ProtectedRouteForAuth><ResetPassword /></ProtectedRouteForAuth>} />
      <Route path='/account/reset-password' element={<ProtectedRouteForAuth><PasswordReset /></ProtectedRouteForAuth>} />

      {/* User Dashboard (protected) */}
      <Route path='/dashboard' element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Overview />} />
        <Route path='profile' element={<Profile />} />
        <Route path='orders' element={<Orders />} />
        <Route path='wishlist' element={<Wishlist />} />
        <Route path='settings' element={<Settings />} />
      </Route>

      {/* Admin Routes */}
      <Route path={`/${ADMIN_ROUTE}/login`} element={
        <ProtectedRouteForAuth>
          <AdminLogin />
        </ProtectedRouteForAuth>
      } />
      <Route path={`/${ADMIN_ROUTE}/dashboard`} element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path={`/${ADMIN_ROUTE}/products`} element={<AdminRoute><AdminProducts /></AdminRoute>} />
      <Route path={`/${ADMIN_ROUTE}/categories`} element={<AdminRoute><AdminCategories /></AdminRoute>} />
      <Route path={`/${ADMIN_ROUTE}/flash-sales`} element={<AdminRoute><AdminFlashSales /></AdminRoute>} />
      <Route path={`/${ADMIN_ROUTE}/orders`} element={<AdminRoute><AdminOrders /></AdminRoute>} />
      <Route path={`/${ADMIN_ROUTE}/blog`} element={<AdminRoute><AdminBlog /></AdminRoute>} />
      <Route path={`/${ADMIN_ROUTE}/users`} element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path={`/${ADMIN_ROUTE}/bank-accounts`} element={<AdminRoute><AdminBankAccounts /></AdminRoute>} />

      <Route path="*" element={<UserRoleChecker />} />

      {/* 404 */}
      <Route path='*' element={
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-indigo-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
          {/* Background Effects */}
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/3 -left-64 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 -right-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 text-center max-w-2xl"
          >
            {/* Animated 404 */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-8"
            >
              <h1 className="text-9xl lg:text-[180px] font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-none mb-4">
                404
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto rounded-full" />
            </motion.div>

            {/* Content */}
            <div className="mb-8">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                Oops! Page Not Found
              </h2>
              <p className="text-xl text-gray-300 mb-2">
                The page you're looking for seems to have wandered off...
              </p>
              <p className="text-gray-400">
                It might have gone on an adventure to another dimension!
              </p>
            </div>

            {/* Floating Icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-8"
            >
              <div className="p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full border border-cyan-500/30">
                <HiSparkles className="w-12 h-12 text-cyan-400" />
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-bold transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/50"
                >
                  <HiHome className="w-5 h-5" />
                  Go to Home
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900/50 border border-gray-800/50 text-gray-300 hover:text-white rounded-lg font-bold transition-all hover:border-cyan-500/50"
                >
                  <HiArrowLeft className="w-5 h-5" />
                  Go Back
                </button>
              </motion.div>
            </div>

            {/* Helpful Text */}
            <p className="text-gray-400 text-sm">
              Try visiting our <Link to="/" className="text-cyan-400 hover:text-cyan-300 underline transition-colors">homepage</Link> or browsing our <Link to="/category" className="text-cyan-400 hover:text-cyan-300 underline transition-colors">book collection</Link>
            </p>
          </motion.div>
        </div>
      } />
    </Routes>
  )
}

export default App