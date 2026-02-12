import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import { motion } from 'framer-motion';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiArrowRight } from 'react-icons/hi';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/AuthLayout';

const UserLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authenticated, user, authLoading, isInitialized } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Show loading while auth is initializing
  if (authLoading || !isInitialized) {
    return (
      <AuthLayout
        title="Welcome Back"
        subtitle="Sign in to your EStarr Bookart account"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full"></div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Handle redirect if already authenticated
  useEffect(() => {
    // This component is wrapped in ProtectedRouteForAuth, so this shouldn't happen
    // But keep it as a safety check
    if (authenticated && user) {
      console.log('User already authenticated, redirecting...');
      const redirectPath = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      const timer = setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [authenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const result = await login(formData);
      
      if (result.success) {
        // Save token if present
        if (result.data?.token) {
          localStorage.setItem('token', result.data.token);
          localStorage.setItem('accessToken', result.data.token);
        }
        
        // Make sure user object is saved with role
        if (result.data) {
          localStorage.setItem('user', JSON.stringify(result.data));
          console.log('✅ User saved to localStorage with role:', result.data.role);
        }
        
        // Check user role and redirect accordingly
        if (result.data?.role === 'admin') {
          toast.success('Redirecting to admin dashboard...');
          console.log('🔄 Admin logged in via user login, redirecting to:', '/admin/dashboard');
          setTimeout(() => {
            navigate('/admin/dashboard', { replace: true });
          }, 500);
        } else {
          toast.success('Welcome back!');
          console.log('🔄 User logged in, redirecting to:', '/dashboard');
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 500);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your EStarr Bookart account"
    >
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onSubmit={handleLogin}
        className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 shadow-2xl"
      >
        {/* Email Field */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
            <HiMail className="w-4 h-4 text-cyan-400" />
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
            className="w-full px-4 py-3 bg-white/5 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Password Field */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
              <HiLockClosed className="w-4 h-4 text-cyan-400" />
              Password
            </label>
            <Link
              to="/account/forgot-password"
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-white/5 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
            >
              {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            id="remember"
            className="w-4 h-4 rounded border-gray-700/50 bg-white/5 focus:ring-cyan-500"
          />
          <label htmlFor="remember" className="text-sm text-gray-300">
            Remember me for 30 days
          </label>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              Sign In <HiArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>

        {/* Divider */}
        {/* <div className="my-6">
          <div className="flex items-center">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-700/50" />
            <span className="px-4 text-sm text-gray-500">or continue with</span>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-700/50 to-transparent" />
          </div>
        </div> */}

        {/* Social Login */}
        {/* <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-gray-700/50 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-gray-700/50 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div> */}

        {/* Sign Up Link */}
        <p className="text-center text-gray-400 mt-3">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
            Create one
          </Link>
        </p>
      </motion.form>
    </AuthLayout>
  );
};

export default UserLogin;