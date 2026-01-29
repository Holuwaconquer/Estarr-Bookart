import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { motion } from 'framer-motion';
import { HiMail, HiArrowLeft, HiArrowRight, HiCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/AuthLayout';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authAPI.forgotPassword({ email });
      setSubmitted(true);
      toast.success('Check your email for reset link', {
        icon: '📧',
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid #334155'
        }
      });
    } catch (error) {
      toast.error(error.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle={submitted ? 'Check your email for instructions' : 'Enter your email to reset your password'}
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
              <HiMail className="w-4 h-4 text-cyan-400" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 bg-white/5 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-500 mt-2">
              We'll send a reset link to this email address
            </p>
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
                Sending...
              </>
            ) : (
              <>
                Send Reset Link <HiArrowRight className="w-5 h-5" />
              </>
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
            Email Sent!
          </h3>

          <p className="text-gray-400 mb-4">
            We've sent a password reset link to{' '}
            <span className="text-cyan-400 font-semibold">{email}</span>
          </p>

          <p className="text-sm text-gray-500 mb-6">
            Check your inbox and follow the link to reset your password. The link will expire in 1 hour.
          </p>

          <div className="space-y-4">
            <p className="text-gray-400">
              Didn't receive an email?{' '}
              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                }}
                className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
              >
                Try again
              </button>
            </p>

            <Link
              to="/login"
              className="inline-block px-6 py-2 bg-white/5 hover:bg-white/10 border border-gray-700/50 text-white rounded-lg font-medium transition-all"
            >
              Back to Login
            </Link>
          </div>
        </motion.div>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;