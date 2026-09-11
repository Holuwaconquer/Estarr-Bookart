import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiMenuAlt3,
  HiX,
  HiBell,
  HiCog,
  HiUser,
  HiLogout,
  HiSearch
} from 'react-icons/hi';
import { AuthContext } from '../AuthContext';

const AdminHeader = ({ isOpen, setIsOpen, onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const pageLabels = {
    dashboard: 'Overview',
    products: 'Book inventory',
    categories: 'Categories',
    'flash-sales': 'Flash sales',
    orders: 'Orders',
    blog: 'Editorial studio',
    users: 'Customer directory',
    'shipping-locations': 'Shipping network',
    'bank-accounts': 'Payment accounts'
  };
  const activeSection = Object.keys(pageLabels).find((section) => location.pathname.includes(`/${section}`));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search functionality
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-header sticky top-0 z-30 bg-[#faf9f7]/90 border-b border-[#e8e3dc] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between h-20 px-6">
        {/* Left Section - Menu Toggle */}
        <div className="flex items-center gap-3">
          <div className="md:hidden">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (typeof onMenuClick === 'function') return onMenuClick();
              if (typeof setIsOpen === 'function') return setIsOpen(!isOpen);
            }}
            className="p-2 hover:bg-[#f0ece7] rounded-xl transition-colors"
          >
            {isOpen ? (
              <HiX className="w-6 h-6 text-[#28202f]" />
            ) : (
              <HiMenuAlt3 className="w-6 h-6 text-[#28202f]" />
            )}
          </motion.button>
          </div>
          <div className="hidden md:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9a909f]">Admin workspace</p>
            <p className="mt-1 font-serif text-lg font-semibold text-[#28202f]">{pageLabels[activeSection] || 'Overview'}</p>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-auto">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search books, orders, users..."
                className="w-full px-4 py-2.5 pl-10 bg-white border border-[#e8e3dc] rounded-xl text-[#28202f] placeholder-[#9a909f] focus:outline-none focus:border-[#5b21b6] transition-all"
              />
              <HiSearch className="absolute left-3 top-3 w-5 h-5 text-[#7b7180]" />
            </div>
          </form>
        </div>

        {/* Right Section - Notifications & User Menu */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 hover:bg-[#f0ece7] rounded-xl transition-colors"
          >
            <HiBell className="w-6 h-6 text-[#5b21b6]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#d97706] rounded-full" />
          </motion.button>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              onClick={() => setShowUserMenu(!showUserMenu)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-3 py-2 hover:bg-[#f0ece7] rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-[#5b21b6] flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="text-sm font-medium text-[#28202f] hidden sm:inline">{user?.name}</span>
            </motion.button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-52 bg-white border border-[#e8e3dc] rounded-xl shadow-xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-[#e8e3dc]">
                  <p className="text-sm text-[#7b7180]">Signed in as</p>
                  <p className="font-semibold text-[#28202f] text-sm truncate">{user?.email}</p>
                </div>

                <nav className="py-2">
                  <button
                    onClick={() => {
                      navigate('/admin/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-[#51475a] hover:bg-[#f5f2ee] transition-colors"
                  >
                    <HiCog className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                </nav>

                <div className="border-t border-[#e8e3dc] p-2">
                  <motion.button
                    onClick={handleLogout}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-[#b42318] hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <HiLogout className="w-4 h-4" />
                    <span>Logout</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default AdminHeader;
