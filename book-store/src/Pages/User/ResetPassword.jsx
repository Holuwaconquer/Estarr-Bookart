import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { HiLockClosed, HiEye, HiEyeOff, HiCheckCircle, HiArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/AuthLayout';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  console.log('Reset token and email received:', token, email);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        toast.error('Invalid reset link');
        navigate('/forgot-password');
        return;
      }

      try {
        await authAPI.verifyResetToken(token, email);
        setTokenValid(true);
      } catch (error) {
        toast.error(error.message || 'Invalid or expired reset link');
        navigate('/forgot-password');
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token, email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      await authAPI.resetPasswordWithToken(token, email, password);
      setSubmitted(true);
      toast.success('Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <AuthLayout title="Verifying..." subtitle="Please wait while we verify your reset link">
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={submitted ? "Password Reset Successful" : "Create New Password"}
      subtitle={submitted ? "Your password has been reset" : "Enter your new password below"}
    >
      {!submitted ? (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 shadow-2xl"
        >
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
              <HiLockClosed className="w-4 h-4 text-cyan-400" />
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                required
                className="w-full px-4 py-3 bg-white/5 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Password must be at least 8 characters long
            </p>
          </div>

          <div className="mb-8">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
              <HiLockClosed className="w-4 h-4 text-cyan-400" />
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                className="w-full px-4 py-3 bg-white/5 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

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
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </motion.button>

          <div className="mt-6">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              <HiArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </motion.form>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 shadow-2xl text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <HiCheckCircle className="w-8 h-8 text-white" />
          </motion.div>

          <h3 className="text-2xl font-bold text-white mb-3">
            Password Reset Successful!
          </h3>

          <p className="text-gray-400 mb-6">
            Your password has been successfully reset. You can now log in with your new password.
          </p>

          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
          >
            Go to Login
          </Link>
        </motion.div>
      )}
    </AuthLayout>
  );
};

export default ResetPassword;