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
import AboutUs from './Pages/AboutUs'
import BlogPost from './Pages/BlogPost'

// Import pages with new hierarchical structure
import PrivacyPolicy from './Pages/Legal/PrivacyPolicy';
import TermsOfService from './Pages/Legal/TermsOfService';
import ReturnsPolicy from './Pages/Legal/ReturnsPolicy';
import ShippingInfo from './Pages/Legal/ShippingInfo';
import Faq from './Pages/Support/Faq';
import Contact from './Pages/Contact';
import BrandPage from './Pages/About/BrandPage'

// Layout components for nested routes
import LegalLayout from './layouts/LegalLayout';
import SupportLayout from './layouts/SupportLayout';
import AboutLayout from './layouts/AboutLayout';

const App = () => {
  const ADMIN_ROUTE = import.meta.env.VITE_ADMIN_ROUTE || 'admin'

  return (
    <>
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
        <Route path='blog/:slug' element={<BlogPost />} />
        
        {/* NEW HIERARCHICAL ROUTES - These create proper site structure */}
        
        {/* Legal Routes - Grouped under /legal */}
        <Route path="legal" element={<LegalLayout />}>
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-of-service" element={<TermsOfService />} />
          <Route path="returns-policy" element={<ReturnsPolicy />} />
          <Route path="shipping-info" element={<ShippingInfo />} />
        </Route>
        
        {/* Support Routes - Grouped under /support */}
        <Route path="support" element={<SupportLayout />}>
          <Route path="faq" element={<Faq />} />
        </Route>
        
        {/* About Routes - Grouped under /about */}
        <Route path="about" element={<AboutLayout />}>
        <Route path="/about" element={<AboutUs />} />
          <Route path="brand" element={<BrandPage />} />
        </Route>
        
        {/* Contact remains at root but add breadcrumb */}
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Authentication - Only for unauthenticated users */}
      <Route path='/login' element={<ProtectedRouteForAuth><UserLogin /></ProtectedRouteForAuth>} />
      <Route path='/register' element={<ProtectedRouteForAuth><UserSignup /></ProtectedRouteForAuth>} />
      <Route path='/account/forgot-password' element={<ProtectedRouteForAuth><ForgotPassword /></ProtectedRouteForAuth>} />
      <Route path="/reset-password" element={<ProtectedRouteForAuth><ResetPassword /></ProtectedRouteForAuth>} />
      
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
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
    <WhatsAppButton />
    </>
  )
}

// Separate component for 404
const NotFoundPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-indigo-950 text-white flex items-center justify-center p-4">
    {/* Your 404 content */}
  </div>
);

// Separate WhatsApp button component
const WhatsAppButton = () => (
  <a
    href={'https://wa.me/+2348145157410'}
    target="_blank"
    rel="noreferrer"
    className="fixed bottom-4 right-5 z-50 bg-[#25D366] hover:bg-[#1ebe5d] text-white p-4 rounded-full shadow-lg transition-colors"
  >
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.1-.472-.149-.672.15-.199.297-.768.967-.94 1.165-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.133-.132.297-.347.446-.52.149-.173.198-.298.298-.497.1-.199.05-.373-.025-.522-.075-.148-.672-1.612-.921-2.209-.242-.579-.487-.5-.672-.51l-.573-.01c-.199 0-.522.074-.795.373s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.414.248-.694.248-1.289.173-1.414-.074-.124-.273-.198-.57-.347z" />
      <path d="M12.001 2.003c-5.523 0-10 4.477-10 10 0 1.767.462 3.498 1.337 5.02l-1.38 5.032 5.16-1.356c1.4.764 2.985 1.171 4.882 1.171 5.523 0 10-4.477 10-10s-4.477-10-10-10zm0 18.17c-1.53 0-2.992-.406-4.224-1.16l-.302-.18-3.062.805.817-2.986-.196-.307c-.863-1.345-1.318-2.886-1.318-4.372 0-4.524 3.677-8.2 8.2-8.2 4.523 0 8.2 3.676 8.2 8.2 0 4.523-3.677 8.2-8.2 8.2z" />
    </svg>
  </a>
);

export default App;