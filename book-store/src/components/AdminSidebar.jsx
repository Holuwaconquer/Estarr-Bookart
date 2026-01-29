import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiHome,
  HiShoppingCart,
  HiBookOpen,
  HiNewspaper,
  HiUsers,
  HiCog,
  HiLogout,
  HiMenuAlt3,
  HiX,
  HiChevronDown,
  HiChartBar,
  HiTag,
  HiViewList,
  HiFire
} from 'react-icons/hi';
import { AuthContext } from '../AuthContext';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [expandedMenu, setExpandedMenu] = useState(null);

  const menuItems = [
    { 
      label: 'Dashboard', 
      path: '/admin/dashboard', 
      icon: HiHome 
    },
    { 
      label: 'Products', 
      icon: HiBookOpen,
      submenu: [
        { label: 'All Books', path: '/admin/products' },
        { label: 'Categories', path: '/admin/categories' },
        { label: 'Flash Sales', path: '/admin/flash-sales', icon: HiFire }
      ]
    },
    { 
      label: 'Orders', 
      path: '/admin/orders', 
      icon: HiShoppingCart 
    },
    { 
      label: 'Blog', 
      icon: HiNewspaper,
      submenu: [
        { label: 'All Posts', path: '/admin/blog' }
      ]
    },
    { 
      label: 'Users', 
      path: '/admin/users', 
      icon: HiUsers 
    },
    { 
      label: 'Analytics', 
      path: '/admin/analytics', 
      icon: HiChartBar 
    },
    { 
      label: 'Settings', 
      icon: HiCog,
      submenu: [
        { label: 'Bank Accounts', path: '/admin/bank-accounts' },
        { label: 'Settings', path: '/admin/settings' }
      ]
    }
  ];

  const isActive = (path) => location.pathname === path;
  const isSubmenuActive = (submenu) => submenu?.some(item => location.pathname === item.path);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Sidebar */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="h-full w-64 hidden md:block bg-white text-gray-900 z-40 md:relative md:translate-x-0 shadow-lg border-r border-gray-200 overflow-y-auto"
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
              <HiBookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                BookStore
              </h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 mx-4 mt-4 rounded-lg bg-gray-100/50">
          <p className="text-xs text-gray-600">Logged in as</p>
          <p className="font-semibold text-gray-900 text-sm truncate">{user?.name}</p>
          <p className="text-xs text-cyan-600 uppercase tracking-wider font-bold">Admin</p>
        </div>

        {/* Menu Items */}
        <nav className="mt-8 px-4 space-y-2">
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.submenu ? (
                <>
                  <motion.button
                    onClick={() => setExpandedMenu(expandedMenu === item.label ? null : item.label)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                      isSubmenuActive(item.submenu)
                        ? 'bg-cyan-100 text-cyan-700 border border-cyan-300'
                        : 'text-gray-700 hover:bg-gray-100/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <HiChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedMenu === item.label ? 'rotate-180' : ''
                      }`}
                    />
                  </motion.button>

                  {/* Submenu Items */}
                  {expandedMenu === item.label && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-4 mt-2 space-y-1"
                    >
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.label}
                          to={subitem.path}
                          className={`block px-4 py-2 rounded-lg text-sm transition-all ${
                            isActive(subitem.path)
                              ? 'bg-cyan-100 text-cyan-700 border-l-2 border-cyan-700'
                              : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {subitem.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-cyan-100 text-cyan-700 border border-cyan-300'
                      : 'text-gray-700 hover:bg-gray-100/50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="absolute bottom-6 left-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-red-100/50 text-red-700 hover:bg-red-100 transition-all border border-red-300"
        >
          <HiLogout className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </motion.button>
      </motion.div>

      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}
    </>
  );
};

export default AdminSidebar;
