import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiLockClosed, HiShieldCheck, HiArrowRight } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../AuthContext';
import api from '../../services/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { setAuthenticated, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call backend login endpoint
      const response = await api.userAPI.login({
        email: formData.email,
        password: formData.password
      });

      if (response && response.data) {
        const { token, user } = response.data;
        
        // Check if user is admin
        if (user.role !== 'admin') {
          toast.error('This account is not authorized for admin access');
          setLoading(false);
          return;
        }

        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Update auth context
        setUser(user);
        setAuthenticated(true);

        toast.success('Admin login successful');
        navigate('/admin/dashboard');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '60px 60px'
              }}></div>
            </div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl mb-6">
                <HiShieldCheck className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
              <p className="text-gray-300">Secure access to dashboard</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiLockClosed className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Access Dashboard
                    <HiArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Security Note */}
            <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-start gap-3">
                <HiShieldCheck className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">
                    This area is restricted to authorized personnel only. 
                    All access is logged and monitored.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Site */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-sm text-gray-300 hover:text-white"
          >
            <HiArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Back to main site
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;