import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff, HiArrowRight, HiCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/AuthLayout';

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
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      toast.success('Account created successfully! Please log in.', {
        icon: '🎉',
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid #334155'
        }
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
      title="Join Estarr BookArt"
      subtitle="Create your premium bookstore account"
    >
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onSubmit={handleSignup}
        className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 shadow-2xl"
      >
        {/* Name Field */}
        <div className="mb-5">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
            <HiUser className="w-4 h-4 text-cyan-400" />
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
            className="w-full px-4 py-3 bg-white/5 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Email Field */}
        <div className="mb-5">
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
        <div className="mb-5">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
            <HiLockClosed className="w-4 h-4 text-cyan-400" />
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

          {/* Password Strength */}
          {formData.password && (
            <div className="mt-3 space-y-2">
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i < passwordStrength
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                        : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${
                  passwordStrength < 2 ? 'text-red-400' :
                  passwordStrength === 2 ? 'text-amber-400' :
                  passwordStrength === 3 ? 'text-blue-400' :
                  'text-green-400'
                }`}>
                  {passwordStrength < 2 && 'Weak password'}
                  {passwordStrength === 2 && 'Fair password'}
                  {passwordStrength === 3 && 'Good password'}
                  {passwordStrength === 4 && 'Strong password'}
                </span>
                {passwordStrength >= 3 && (
                  <HiCheckCircle className="w-4 h-4 text-green-400" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
            <HiLockClosed className="w-4 h-4 text-cyan-400" />
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
              className="w-full px-4 py-3 bg-white/5 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
            >
              {showConfirmPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
            </button>
          </div>
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
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
            className="w-4 h-4 mt-1 rounded border-gray-700/50 bg-white/5 focus:ring-cyan-500"
          />
          <label htmlFor="terms" className="text-sm text-gray-300">
            I agree to the{' '}
            <a href="#" className="text-cyan-400 hover:text-cyan-300">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</a>
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
              Creating Account...
            </>
          ) : (
            <>
              Create Account <HiArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>

        {/* Login Link */}
        <p className="text-center mt-8 text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
            Sign in
          </Link>
        </p>
      </motion.form>
    </AuthLayout>
  );
};

export default UserSignup;