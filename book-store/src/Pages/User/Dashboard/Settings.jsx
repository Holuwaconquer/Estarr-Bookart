import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../AuthContext';
import { userAPI } from '../../../services/api';
import { motion } from 'framer-motion';
import { HiUser, HiMail, HiPhone, HiLocationMarker, HiLockClosed, HiCheckCircle, HiExclamationCircle, HiShieldCheck, HiGlobe, HiBell } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, refreshUser } = useContext(AuthContext); // Changed from reloadProfile to refreshUser
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsAlerts: false,
    newsletter: true,
    twoFactorAuth: false,
    currency: 'NGN',
    language: 'English'
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update formData when user context changes
  useEffect(() => {
    if (user) {
      console.log('Settings - User data:', user); // Debug log
      setFormData({
        name: `${user.name || user.firstname || ''} ${user.lastname || ''}`.trim() || '',
        email: user.email || '',
        phone: user.phone || user.phonenumber || '', // Handle both phone and phonenumber
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || '',
        country: user.country || ''
      });
    }
  }, [user]);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Setting updated');
  };

  const handleSelect = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Preference updated');
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Prepare data for backend
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        state: formData.state,
        zipCode: formData.zipCode
      };

      console.log('Settings - Sending update data:', updateData);
      
      // Call API to update profile
      const response = await userAPI.updateProfile(updateData);
      console.log('Settings - Profile update response:', response);
      
      if (response && (response.status === true || response.success === true)) {
        toast.success('Profile updated successfully!');
        
        // Refresh user data
        if (refreshUser) {
          await refreshUser();
        }
        
        // Update localStorage with phone data
        if (formData.phone) {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          storedUser.phone = formData.phone;
          storedUser.phonenumber = formData.phone;
          localStorage.setItem('user', JSON.stringify(storedUser));
        }
      } else {
        toast.error(response?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Settings - Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    
    if (!passwordData.newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      
      // Call API to change password
      const response = await userAPI.changePassword(
        passwordData.currentPassword, 
        passwordData.newPassword
      );
      
      console.log('Settings - Password change response:', response);
      
      if (response && (response.status === true || response.success === true)) {
        toast.success('Password changed successfully!');
        setPasswordData({ 
          currentPassword: '', 
          newPassword: '', 
          confirmPassword: '' 
        });
      } else {
        toast.error(response?.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Settings - Password change error:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = () => {
    toast.success('Preferences saved successfully!');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
  };

  const tabs = [
    { id: 'profile', label: '👤 Profile', icon: HiUser },
    { id: 'password', label: '🔐 Password', icon: HiLockClosed },
    { id: 'notifications', label: '🔔 Notifications', icon: HiBell },
    { id: 'security', label: '🛡️ Security', icon: HiShieldCheck },
    { id: 'preferences', label: '⚙️ Preferences', icon: HiGlobe }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Settings & Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 overflow-x-auto"
        >
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all text-sm sm:text-base whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label.replace(/^👤 |🔐 |🔔 |🛡️ |⚙️ /, '')}
              </button>
            );
          })}
        </motion.div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <form
              onSubmit={handleProfileSubmit}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <HiUser className="w-6 h-6" />
                  Personal Information
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <HiUser className="w-4 h-4 text-purple-600" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <HiMail className="w-4 h-4 text-purple-600" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all cursor-not-allowed"
                      placeholder="your@email.com"
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <HiPhone className="w-4 h-4 text-purple-600" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      placeholder="+234 XXX XXX XXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <HiLocationMarker className="w-4 h-4 text-purple-600" />
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      placeholder="Your city"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <HiLocationMarker className="w-4 h-4 text-purple-600" />
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleProfileChange}
                    rows="3"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all resize-none"
                    placeholder="Your street address"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      placeholder="State"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Zip Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      placeholder="Zip code"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      placeholder="Country"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <motion.div
            key="password"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <form
              onSubmit={handlePasswordSubmit}
              className="bg-white rounded-xl shadow-lg overflow-hidden max-w-md mx-auto"
            >
              <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <HiLockClosed className="w-6 h-6" />
                  Change Password
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <HiLockClosed className="w-4 h-4 text-red-600" />
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <HiLockClosed className="w-4 h-4 text-red-600" />
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                    placeholder="Enter new password"
                  />
                  <p className="text-xs text-gray-500">Min 8 characters, 1 uppercase, 1 number</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <HiLockClosed className="w-4 h-4 text-red-600" />
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Password Requirements:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${passwordData.newPassword.length >= 8 ? 'bg-green-500' : 'bg-blue-300'}`}></div>
                      At least 8 characters
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-blue-300'}`}></div>
                      One uppercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${/\d/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-blue-300'}`}></div>
                      One number
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword.length > 0 ? 'bg-green-500' : 'bg-blue-300'}`}></div>
                      Passwords match
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <HiBell className="w-6 h-6" />
                  Notification Preferences
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive order updates via email' },
                  { key: 'pushNotifications', label: 'Push Notifications', desc: 'Get browser notifications for new arrivals' },
                  { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Receive SMS for important updates' },
                  { key: 'newsletter', label: 'Newsletter', desc: 'Weekly curated book recommendations' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-4 border-b last:border-b-0">
                    <div>
                      <div className="font-medium text-gray-900">{item.label}</div>
                      <div className="text-sm text-gray-600">{item.desc}</div>
                    </div>
                    <button
                      onClick={() => handleToggle(item.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings[item.key] ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings[item.key] ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={handleSavePreferences}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Save Notification Settings
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <HiShieldCheck className="w-6 h-6" />
                  Security Settings
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between py-4 border-b">
                  <div>
                    <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-600">Add an extra layer of security to your account</div>
                  </div>
                  <button
                    onClick={() => handleToggle('twoFactorAuth')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.twoFactorAuth ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between py-4 border-b">
                  <div>
                    <div className="font-medium text-gray-900">Login Activity</div>
                    <div className="text-sm text-gray-600">View recent login attempts and sessions</div>
                  </div>
                  <button className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                    View Logs
                  </button>
                </div>
                
                <div className="flex items-center justify-between py-4">
                  <div>
                    <div className="font-medium text-gray-900">Account Privacy</div>
                    <div className="text-sm text-gray-600">Control what information is visible to others</div>
                  </div>
                  <button className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                    Manage Privacy
                  </button>
                </div>
                
                <button
                  onClick={handleSavePreferences}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Save Security Settings
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <motion.div
            key="preferences"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <HiGlobe className="w-6 h-6" />
                  Account Preferences
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Currency
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleSelect('currency', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="NGN">NGN (₦)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSelect('language', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Italian">Italian</option>
                    <option value="Portuguese">Portuguese</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme Preference
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <button className="flex flex-col items-center p-4 border rounded-lg hover:border-purple-600 transition-colors">
                      <div className="w-full h-8 bg-gray-100 rounded mb-2"></div>
                      <span className="text-sm">Light</span>
                    </button>
                    <button className="flex flex-col items-center p-4 border border-purple-600 rounded-lg bg-purple-50">
                      <div className="w-full h-8 bg-gray-900 rounded mb-2"></div>
                      <span className="text-sm">Dark</span>
                    </button>
                    <button className="flex flex-col items-center p-4 border rounded-lg hover:border-purple-600 transition-colors">
                      <div className="w-full h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded mb-2"></div>
                      <span className="text-sm">Auto</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-4 border-t">
                  <div>
                    <div className="font-medium text-gray-900">Marketing Preferences</div>
                    <div className="text-sm text-gray-600">Control how we contact you for promotions</div>
                  </div>
                  <button className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                    Edit Preferences
                  </button>
                </div>
                
                <button
                  onClick={handleSavePreferences}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Settings;