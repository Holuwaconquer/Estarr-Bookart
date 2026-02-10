import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { user, logout } = useContext(AuthContext);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      className="sticky top-0 z-30 bg-gradient-to-r from-gray-900 via-gray-950 to-gray-900 border-b border-gray-800/50 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between h-20 px-6">
        {/* Left Section - Menu Toggle */}
        <div className="md:hidden">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (typeof onMenuClick === 'function') return onMenuClick();
              if (typeof setIsOpen === 'function') return setIsOpen(!isOpen);
            }}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isOpen ? (
              <HiX className="w-6 h-6 text-white" />
            ) : (
              <HiMenuAlt3 className="w-6 h-6 text-white" />
            )}
          </motion.button>
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
                className="w-full px-4 py-2 pl-10 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all"
              />
              <HiSearch className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
            </div>
          </form>
        </div>

        {/* Right Section - Notifications & User Menu */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <HiBell className="w-6 h-6 text-gray-400 hover:text-cyan-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </motion.button>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              onClick={() => setShowUserMenu(!showUserMenu)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="text-sm font-medium text-white hidden sm:inline">{user?.name}</span>
            </motion.button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-800">
                  <p className="text-sm text-gray-400">Signed in as</p>
                  <p className="font-semibold text-white text-sm">{user?.email}</p>
                </div>

                <nav className="py-2">
                  <button
                    onClick={() => {
                      navigate('/admin/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800/50 transition-colors"
                  >
                    <HiCog className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                </nav>

                <div className="border-t border-gray-800 p-2">
                  <motion.button
                    onClick={handleLogout}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
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
