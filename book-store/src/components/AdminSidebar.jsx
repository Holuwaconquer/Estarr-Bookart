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
  HiMap,
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

const AdminSidebar = (props) => {
  // Support multiple prop namings used across pages: `isOpen/setIsOpen` and `open/setOpen`
  const isOpen = typeof props.isOpen !== 'undefined' ? props.isOpen : props.open;
  const setIsOpen = props.setIsOpen || props.setOpen || (() => {});
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
      label: 'Shipping Locations', 
      path: '/admin/shipping-locations', 
      icon: HiMap 
    },
    // { 
    //   label: 'Analytics', 
    //   path: '/admin/analytics', 
    //   icon: HiChartBar 
    // },
    { 
      label: 'Settings', 
      icon: HiCog,
      submenu: [
        { label: 'Bank Accounts', path: '/admin/bank-accounts' },
        // { label: 'Settings', path: '/admin/settings' }
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
        className="admin-sidebar hidden h-full w-64 flex-col bg-[#28202f] text-white z-40 md:relative md:flex md:translate-x-0 shadow-2xl border-r border-white/10 overflow-hidden"
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-white/10">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#d7f36a] flex items-center justify-center">
              <HiBookOpen className="w-6 h-6 text-[#28202f]" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold text-white">
                EStarr Bookart
              </h1>
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">Admin workspace</p>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border border-white/10 mx-4 mt-4 rounded-xl bg-white/5">
          <p className="text-xs text-white/45">Logged in as</p>
          <p className="font-semibold text-white text-sm truncate">{user?.name}</p>
          <p className="text-xs text-[#d7f36a] uppercase tracking-wider font-bold">Admin</p>
        </div>

        {/* Menu Items */}
        <nav className="mt-8 flex-1 overflow-y-auto px-4 pb-6 space-y-2">
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.submenu ? (
                <>
                  <motion.button
                    onClick={() => setExpandedMenu(expandedMenu === item.label ? null : item.label)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                      isSubmenuActive(item.submenu)
                        ? 'bg-[#d7f36a] text-[#28202f] border border-[#d7f36a]'
                        : 'text-white/65 hover:bg-white/10 hover:text-white'
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
                              ? 'bg-white/10 text-[#d7f36a] border-l-2 border-[#d7f36a]'
                              : 'text-white/55 hover:text-white hover:bg-white/10'
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
                      ? 'bg-[#d7f36a] text-[#28202f] border border-[#d7f36a]'
                      : 'text-white/65 hover:bg-white/10 hover:text-white'
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
          className="mx-4 mb-5 mt-auto flex shrink-0 items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white/65 transition-all hover:bg-white/10 hover:text-white"
        >
          <HiLogout className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </motion.button>
      </motion.div>

      {/* Mobile Overlay */}
      {/* Mobile Sidebar Panel */}
      {isOpen && (
        <motion.aside
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="admin-sidebar fixed top-0 left-0 bottom-0 z-50 flex w-64 flex-col bg-[#28202f] text-white shadow-2xl border-r border-white/10 overflow-hidden md:hidden"
        >
          {/* Logo Section */}
          <div className="p-6 border-b border-white/10">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#d7f36a] flex items-center justify-center">
                <HiBookOpen className="w-6 h-6 text-[#28202f]" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-semibold text-white">
                  EStarr Bookart
                </h1>
                <p className="text-xs uppercase tracking-[0.16em] text-white/45">Admin workspace</p>
              </div>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-4 border border-white/10 mx-4 mt-4 rounded-xl bg-white/5">
            <p className="text-xs text-white/45">Logged in as</p>
            <p className="font-semibold text-white text-sm truncate">{user?.name}</p>
            <p className="text-xs text-[#d7f36a] uppercase tracking-wider font-bold">Admin</p>
          </div>

          {/* Menu Items (mobile) */}
          <nav className="mt-8 flex-1 overflow-y-auto px-4 pb-6 space-y-2">
            {menuItems.map((item) => (
              <div key={item.label}>
                {item.submenu ? (
                  <>
                    <motion.button
                      onClick={() => setExpandedMenu(expandedMenu === item.label ? null : item.label)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                        isSubmenuActive(item.submenu)
                          ? 'bg-[#d7f36a] text-[#28202f] border border-[#d7f36a]'
                          : 'text-white/65 hover:bg-white/10 hover:text-white'
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

                    {expandedMenu === item.label && (
                      <motion.div className="ml-4 mt-2 space-y-1">
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.label}
                            to={subitem.path}
                            onClick={() => setIsOpen(false)}
                            className={`block px-4 py-2 rounded-lg text-sm transition-all ${
                              isActive(subitem.path)
                                ? 'bg-white/10 text-[#d7f36a] border-l-2 border-[#d7f36a]'
                                : 'text-white/55 hover:text-white hover:bg-white/10'
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
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive(item.path)
                        ? 'bg-[#d7f36a] text-[#28202f] border border-[#d7f36a]'
                        : 'text-white/65 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Logout Button (mobile) */}
          <motion.button
            onClick={() => { handleLogout(); setIsOpen(false); }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mx-4 mb-5 mt-auto flex shrink-0 items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white/65 transition-all hover:bg-white/10 hover:text-white"
          >
            <HiLogout className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </motion.aside>
      )}

      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}
    </>
  );
};

export default AdminSidebar;
