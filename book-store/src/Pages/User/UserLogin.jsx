import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import { motion } from 'framer-motion';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiArrowRight } from 'react-icons/hi';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/AuthLayout';

// ---------------------------------------------------------------------
// Same palette as the rest of the app. Move to /lib/theme.js if you
// haven't already — this is the fifth file with this exact block.
// ---------------------------------------------------------------------
const PURPLE = ['#5B21B6', '#6D28D9', '#7C3AED', '#8B5CF6', '#A78BFA'];
const DEEP = '#4C1D95';

// Shared by UserLogin and UserSignup — clicking the inactive tab
// navigates to the other auth route. Keep this in sync between the
// two files (or better, extract to its own component).
const AuthTabs = ({ active }) => {
  const navigate = useNavigate();
  const tabs = [
    { id: 'login', label: 'Sign In', path: '/login' },
    { id: 'signup', label: 'Create Account', path: '/register' },
  ];

  return (
    <div className="relative flex bg-black/[0.04] rounded-xl p-1 mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => tab.id !== active && navigate(tab.path)}
          className="relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors z-10"
          style={{ color: active === tab.id ? '#fff' : '#64748B' }}
        >
          {active === tab.id && (
            <motion.div
              layoutId="auth-tab-pill"
              className="absolute inset-0 rounded-lg -z-10"
              style={{ background: `linear-gradient(120deg, ${PURPLE[1]}, ${DEEP})` }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

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
          <div className="w-11 h-11 border-4 rounded-full animate-spin" style={{ borderColor: `${PURPLE[2]}22`, borderTopColor: PURPLE[0] }} />
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
      const requestedPath = new URLSearchParams(location.search).get('next');
      const nextPath = requestedPath && requestedPath.startsWith('/') && !requestedPath.startsWith('//')
        ? requestedPath
        : null;
      const redirectPath = user?.role === 'admin' ? '/admin/dashboard' : (nextPath || '/dashboard');
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

        const requestedPath = new URLSearchParams(location.search).get('next');
        const nextPath = requestedPath && requestedPath.startsWith('/') && !requestedPath.startsWith('//')
          ? requestedPath
          : null;

        // Check user role and redirect to the requested internal page when available.
        if (result.data?.role === 'admin') {
          toast.success('Redirecting to admin dashboard...');
          console.log('🔄 Admin logged in via user login, redirecting to:', '/admin/dashboard');
          setTimeout(() => {
            navigate('/admin/dashboard', { replace: true });
          }, 500);
        } else {
          toast.success('Welcome back!');
          const destination = nextPath || '/dashboard';
          console.log('🔄 User logged in, redirecting to:', destination);
          setTimeout(() => {
            navigate(destination, { replace: true });
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
        transition={{ delay: 0.3 }}
        onSubmit={handleLogin}
        className="bg-white border border-black/[0.06] rounded-2xl p-8"
        style={{ boxShadow: '0 10px 40px rgba(76,29,149,0.08)' }}
      >
        <AuthTabs active="login" />

        {/* Email Field */}
        <div className="mb-5">
          <label className="flex items-center gap-2 text-sm font-semibold text-ink/70 mb-2">
            <HiMail className="w-4 h-4" style={{ color: PURPLE[0] }} />
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
            className="w-full px-4 py-3 bg-black/[0.02] border border-black/[0.08] rounded-lg text-ink placeholder-ink/30 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
            style={{ '--tw-ring-color': `${PURPLE[2]}55` }}
          />
        </div>

        {/* Password Field */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-ink/70">
              <HiLockClosed className="w-4 h-4" style={{ color: PURPLE[0] }} />
              Password
            </label>
            <Link to="/account/forgot-password" className="text-sm font-medium transition-colors" style={{ color: PURPLE[0] }}>
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
              className="w-full px-4 py-3 bg-black/[0.02] border border-black/[0.08] rounded-lg text-ink placeholder-ink/30 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              style={{ '--tw-ring-color': `${PURPLE[2]}55` }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ink/30 hover:text-ink/60 transition-colors"
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
            className="w-4 h-4 rounded border-black/20 text-purple-600 focus:ring-0"
          />
          <label htmlFor="remember" className="text-sm text-ink/60">
            Remember me for 30 days
          </label>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(120deg, ${PURPLE[1]}, ${DEEP})`, boxShadow: `0 10px 24px ${PURPLE[1]}40` }}
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

        {/* Sign Up Link */}
        <p className="text-center text-ink/50 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold transition-colors" style={{ color: PURPLE[0] }}>
            Create one
          </Link>
        </p>
      </motion.form>
    </AuthLayout>
  );
};

export default UserLogin;