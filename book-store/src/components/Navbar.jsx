import React, { useState, useEffect, useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  IoSearchOutline, 
  IoPersonOutline,
  IoCartOutline,
  IoMenu,
  IoClose,
  IoBookOutline,
  IoChevronDown,
  IoSparklesOutline
} from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext.jsx';
import { HiSparkles } from 'react-icons/hi';
import { categoryAPI } from '../services/api';
import Estarr from '../assets/estarr.jpeg';
import { AuthContext } from '../AuthContext.jsx';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const { totalItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAllCategories();
        const apiCategories = response.data?.categories || [];
        
        if (apiCategories.length > 0) {
          const categorySubmenu = apiCategories.map((cat) => ({
            path: `/category?cat=${cat.name.toLowerCase()}`,
            label: cat.name,
            icon: cat.icon || '📚'
          }));
          setCategories(categorySubmenu);
        } else {
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const { user } = useContext(AuthContext);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/category', label: 'Collections' },
    { path: '/blog', label: 'Blog' },
    // Conditionally show appropriate dashboard
    { 
      path: user?.role === 'admin' ? '/admin/dashboard' : '/dashboard', 
      label: user?.role === 'admin' ? 'Admin Dashboard' : 'Dashboard' 
    }
  ];

  const isLoggedIn = !!user;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/category?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className='fixed left-0 right-0 z-40 transition-all duration-300 top-0 bg-gray-100 py-3'
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group relative z-20">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="w-8 h-8 p-1 md:w-12 md:h-12 bg-white rounded flex items-center justify-center">
                  <img 
                    src={Estarr} 
                    className='w-full h-full object-contain drop-shadow-lg' 
                    alt="EStarr Bookart Logo" 
                  />
                </div>
                <div className="absolute -inset-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </motion.div>
              <div className="flex flex-col">
                <motion.h1 
                  className="md:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.02 }}
                >
                  EStarr Bookart
                </motion.h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                link.submenu ? (
                  <div key={link.label} className="relative group">
                    <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-2 min-w-[240px] border border-gray-800/50">
                        {link.submenu.map((sub) => (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800/50 text-gray-300 hover:text-white font-medium transition-all duration-300"
                          >
                            <span className="text-lg">{sub.icon}</span>
                            <span>{sub.label}</span>
                            <HiSparkles className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `relative px-4 py-3 font-medium transition-all duration-300 ${
                        isActive 
                          ? 'text-gray-800' 
                          : 'text-gray-500 hover:text-gray-400'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {link.label}
                        {isActive && (
                          <motion.div
                            layoutId="navbar-indicator"
                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                )
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center md:gap-2">
              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-xl hover:bg-gray-800/50 transition-all duration-300 group"
                aria-label="Search"
              >
                <IoSearchOutline className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </motion.button>

              {/* Cart */}
              <Link to="/cart" className="relative group" aria-label="Cart">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-xl hover:bg-gray-800/50 transition-all duration-300"
                >
                  <IoCartOutline className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </motion.button>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </Link>

              {/* Sign In / Profile */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(isLoggedIn ? (user.role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/login')}
                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 group"
              >
                {isLoggedIn ? (
                  <>
                    <IoPersonOutline className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>My Profile</span>
                  </>
                ) : (
                  <>
                    <IoPersonOutline className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Sign In</span>
                  </>
                )}
              </motion.button>

              {/* Mobile Menu Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-800/50 transition-all duration-300"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <IoClose className="w-6 h-6 text-gray-300" />
                ) : (
                  <IoMenu className="w-6 h-6 text-gray-300" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-gray-900/95 backdrop-blur-xl border-t border-gray-800/50 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    link.submenu ? (
                      <div key={link.label} className="flex flex-col">
                        <div className="font-semibold text-gray-300 px-4 py-3 rounded-xl bg-gray-800/30">
                          {link.label}
                        </div>
                        <div className="pl-6 mt-2 flex flex-col gap-1">
                          {link.submenu.map((sub) => (
                            <Link
                              key={sub.path}
                              to={sub.path}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800/50 transition-all duration-300"
                            >
                              <span className="text-lg">{sub.icon}</span>
                              <span>{sub.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                            isActive 
                              ? 'text-white bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30' 
                              : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                          }`
                        }
                      >
                        {link.label}
                      </NavLink>
                    )
                  ))}
                  <div className="mt-4 pt-4 border-t border-gray-800/50">
                    <button
                      onClick={() => {
                        navigate('/login');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
                    >
                      <IoPersonOutline className="w-5 h-5" />
                      Sign In
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Full-screen Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-start justify-center pt-32"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearch}>
                <div className="relative">
                  {/* Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl blur-2xl"></div>
                  
                  {/* Search Container */}
                  <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-800/50">
                    <div className="flex items-center px-6">
                      <IoSearchOutline className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search books, authors, or topics..."
                        className="flex-1 px-6 py-5 text-lg bg-transparent border-none outline-none text-white placeholder-gray-500"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setIsSearchOpen(false)}
                        className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium bg-gray-800/50 rounded-lg transition-colors"
                      >
                        ESC
                      </button>
                    </div>
                    
                    {/* Quick Suggestions */}
                    <div className="border-t border-gray-800/50 p-4">
                      <div className="flex flex-wrap gap-2">
                        {['AI Books', 'Bestsellers', 'New Arrivals', 'Science Fiction', 'Biographies', 'Self-Help'].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              setSearchQuery(tag);
                              handleSearch({ preventDefault: () => {} });
                            }}
                            className="px-3 py-1.5 text-sm bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-300"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
              
              {/* Close overlay */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={() => setIsSearchOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <IoClose className="w-8 h-8" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header - Adjusted for new design */}
      <div className={`transition-all duration-300 ${isScrolled ? 'h-20' : 'h-18'}`}></div>
    </>
  );
};

export default Navbar;