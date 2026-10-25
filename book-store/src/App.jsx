import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiHome, HiArrowLeft, HiSparkles } from 'react-icons/hi'
import { lazy, Suspense } from 'react'

const Home = lazy(() => import('./Pages/Home'));
const Landingpage = lazy(() => import('./Pages/Landingpage'));
const Cart = lazy(() => import('./Pages/Cart'));
const Checkout = lazy(() => import('./Pages/Checkout'));
const CategoryPage = lazy(() => import('./Pages/CategoryPage'));
const ProductDetail = lazy(() => import('./Pages/ProductDetail'));
const BlogPage = lazy(() => import('./Pages/BlogPage'));
const BlogDetail = lazy(() => import('./Pages/BlogDetail'));

// User Pages
const UserLogin = lazy(() => import('./Pages/User/UserLogin'));
const UserSignup = lazy(() => import('./Pages/User/UserSignup'));
const ForgotPassword = lazy(() => import('./Pages/User/ForgotPassword'));
const ResetPassword = lazy(() => import('./Pages/User/ResetPassword'));
const PasswordReset = lazy(() => import('./Pages/User/PasswordReset'));

// Dashboard Layout
const DashboardLayout = lazy(() => import('./layouts/DashboardLayouts'));
const Overview = lazy(() => import('./Pages/User/Dashboard/Overview'));
const Profile = lazy(() => import('./Pages/User/Dashboard/Profile'));
const Orders = lazy(() => import('./Pages/User/Dashboard/Orders'));
const Wishlist = lazy(() => import('./Pages/User/Dashboard/Wishlist'));
const Settings = lazy(() => import('./Pages/User/Dashboard/Settings'));

// Admin Pages
const AdminLogin = lazy(() => import('./Pages/Admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./Pages/Admin/AdminDashoard'));
const AdminProducts = lazy(() => import('./Pages/Admin/AdminProducts'));
const AdminCategories = lazy(() => import('./Pages/Admin/AdminCategories'));
const AdminFlashSales = lazy(() => import('./Pages/Admin/AdminFlashSales'));
const AdminOrders = lazy(() => import('./Pages/Admin/AdminOrders'));
const AdminBlog = lazy(() => import('./Pages/Admin/AdminBlog'));
const AdminBankAccounts = lazy(() => import('./Pages/Admin/AdminBankAccounts'));
const AdminUsers = lazy(() => import('./Pages/Admin/AdminUsers'));
const AdminShippingLocations = lazy(() => import('./Pages/Admin/AdminShippingLocations'));
import ProtectedRoute from './components/ProtectedRoute'
import ProtectedRouteForAuth from './components/ProtectedRouteForAuth'
import AdminRoute from './components/AdminRoute'
import UserRoleChecker from './components/UserRoleChecker'
import EstherAssistant from './components/EstherAssistant'
const AboutUs = lazy(() => import('./Pages/AboutUs'));
const BlogPost = lazy(() => import('./Pages/BlogPost'));

// Import pages with new hierarchical structure
const PrivacyPolicy = lazy(() => import('./Pages/Legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./Pages/Legal/TermsOfService'));
const ReturnsPolicy = lazy(() => import('./Pages/Legal/ReturnsPolicy'));
const ShippingInfo = lazy(() => import('./Pages/Legal/ShippingInfo'));
const Faq = lazy(() => import('./Pages/Support/Faq'));
const Contact = lazy(() => import('./Pages/Contact'));
const BrandPage = lazy(() => import('./Pages/About/BrandPage'));

// Layout components for nested routes
const LegalLayout = lazy(() => import('./layouts/LegalLayout'));
const SupportLayout = lazy(() => import('./layouts/SupportLayout'));
const AboutLayout = lazy(() => import('./layouts/AboutLayout'));

const App = () => {
  const ADMIN_ROUTE = import.meta.env.VITE_ADMIN_ROUTE || 'admin'

  return (
    <>
    <Suspense fallback={
      <main role="status" className="min-h-screen bg-paper flex items-center justify-center text-ink">
        Loading page...
      </main>
    }>
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
      <Route path={`/${ADMIN_ROUTE}/shipping-locations`} element={<AdminRoute><AdminShippingLocations /></AdminRoute>} />

      <Route path="*" element={<UserRoleChecker />} />

      {/* 404 */}
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
    </Suspense>
    <EstherAssistant />
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