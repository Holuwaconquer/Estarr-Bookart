import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff, HiArrowRight, HiCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/AuthLayout';

// ---------------------------------------------------------------------
// Same palette as the rest of the app.
// ---------------------------------------------------------------------
const PURPLE = ['#5B21B6', '#6D28D9', '#7C3AED', '#8B5CF6', '#A78BFA'];
const DEEP = '#4C1D95';
const AMBER = '#D97706';
const TEAL = '#0F766E';
const DANGER = '#DC2626';

// Same tab switcher as UserLogin.jsx — keep in sync (or extract shared).
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

// Strength colors mapped onto the same palette instead of the old
// red/amber/blue/green mix, so the meter still reads weak→strong at a
// glance without leaving the brand hue for "good".
const strengthColor = (level) => {
  if (level < 2) return DANGER;
  if (level === 2) return AMBER;
  if (level === 3) return PURPLE[2];
  return TEAL;
};
const strengthLabel = (level) => {
  if (level < 2) return 'Weak password';
  if (level === 2) return 'Fair password';
  if (level === 3) return 'Good password';
  return 'Strong password';
};

const UserSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password') calculatePasswordStrength(value);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordStrength < 2) {
      toast.error('Password must be strong (min 8 chars, uppercase, lowercase, number)');
      return;
    }

    try {
      setLoading(true);
      await authAPI.register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });

      toast.success('Account created successfully! Please log in.', {
        icon: '🎉',
        style: { background: '#1E1B29', color: '#fff', border: '1px solid #4C1D95' }
      });
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Join EStarr Bookart"
      subtitle="Create your premium bookstore account"
    >
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onSubmit={handleSignup}
        className="bg-white border border-black/[0.06] rounded-2xl p-8"
        style={{ boxShadow: '0 10px 40px rgba(76,29,149,0.08)' }}
      >
        <AuthTabs active="signup" />

        {/* Name Field */}
        <div className="mb-5">
          <label className="flex items-center gap-2 text-sm font-semibold text-ink/70 mb-2">
            <HiUser className="w-4 h-4" style={{ color: PURPLE[0] }} />
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
            className="w-full px-4 py-3 bg-black/[0.02] border border-black/[0.08] rounded-lg text-ink placeholder-ink/30 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
            style={{ '--tw-ring-color': `${PURPLE[2]}55` }}
          />
        </div>

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
          <label className="flex items-center gap-2 text-sm font-semibold text-ink/70 mb-2">
            <HiLockClosed className="w-4 h-4" style={{ color: PURPLE[0] }} />
            Password
          </label>
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

          {/* Password Strength */}
          {formData.password && (
            <div className="mt-3 space-y-2">
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{ background: i < passwordStrength ? strengthColor(passwordStrength) : 'rgba(0,0,0,0.08)' }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium" style={{ color: strengthColor(passwordStrength) }}>
                  {strengthLabel(passwordStrength)}
                </span>
                {passwordStrength >= 3 && (
                  <HiCheckCircle className="w-4 h-4" style={{ color: TEAL }} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-ink/70 mb-2">
            <HiLockClosed className="w-4 h-4" style={{ color: PURPLE[0] }} />
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-black/[0.02] border border-black/[0.08] rounded-lg text-ink placeholder-ink/30 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              style={{ '--tw-ring-color': `${PURPLE[2]}55` }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ink/30 hover:text-ink/60 transition-colors"
            >
              {showConfirmPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
            </button>
          </div>
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: TEAL }}>
              <HiCheckCircle className="w-4 h-4" /> Passwords match
            </p>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2 mb-6">
          <input
            type="checkbox"
            id="terms"
            required
            className="w-4 h-4 mt-1 rounded border-black/20 text-purple-600 focus:ring-0"
          />
          <label htmlFor="terms" className="text-sm text-ink/60">
            I agree to the{' '}
            <a href="#" className="font-medium" style={{ color: PURPLE[0] }}>Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="font-medium" style={{ color: PURPLE[0] }}>Privacy Policy</a>
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
              Creating Account...
            </>
          ) : (
            <>
              Create Account <HiArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>

        {/* Login Link */}
        <p className="text-center mt-6 text-ink/50">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold transition-colors" style={{ color: PURPLE[0] }}>
            Sign in
          </Link>
        </p>
      </motion.form>
    </AuthLayout>
  );
};

export default UserSignup;