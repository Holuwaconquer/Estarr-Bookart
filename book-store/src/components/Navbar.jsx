import React, { useState, useEffect, useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { IoSearchOutline, IoPersonOutline, IoCartOutline, IoMenu, IoClose } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext.jsx';
import { categoryAPI } from '../services/api';
import Estarr from '../assets/estarr.jpeg';
import { AuthContext } from '../AuthContext.jsx';

// Vivid palette shared across the site — used for the sliding pill,
// category bubbles, and spine tags on book cards.
export const VIVID = ['#6C3CE9', '#FF3D81', '#FF6B4A', '#FFB800', '#00C2A8', '#3D8BFF'];

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const { totalItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAllCategories();
        const apiCategories = response.data?.categories || (Array.isArray(response.data) ? response.data : []);
        if (apiCategories.length > 0) {
          setCategories(
            apiCategories.map((cat, i) => ({
              path: `/category?cat=${cat.name.toLowerCase()}`,
              label: cat.name,
              tint: VIVID[i % VIVID.length],
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const { user } = useContext(AuthContext);
  const isLoggedIn = !!user;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/category', label: 'Shop' },
    { path: '/blog', label: 'Blog' },
    { path: user?.role === 'admin' ? '/admin/dashboard' : '/dashboard', label: user?.role === 'admin' ? 'Admin' : 'You' },
  ];

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
      {/* Floating bubble navbar */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed left-0 right-0 top-4 z-50 px-4"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo bubble */}
          <Link to="/" className="flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.06, rotate: -4 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2.5 bg-white/80 backdrop-blur-xl border border-white/60 rounded-full pl-2 pr-4 py-2 shadow-[0_8px_30px_rgba(108,60,233,0.15)]"
            >
              <div
                className="w-9 h-9 rounded-full p-[2px] flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#6C3CE9,#FF3D81,#FFB800)' }}
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <img src={Estarr} className="w-full h-full object-contain" alt="EStarr Bookart" />
                </div>
              </div>
              <span className="font-serif text-lg font-semibold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg,#6C3CE9,#FF3D81)' }}>
                EStarr Bookart
              </span>
            </motion.div>
          </Link>

          {/* Center pill nav — desktop only */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/80 backdrop-blur-xl border border-white/60 rounded-full px-1.5 py-1.5 shadow-[0_8px_30px_rgba(108,60,233,0.12)]">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} end={link.path === '/'} className="relative">
                {({ isActive }) => (
                  <span className="relative block px-5 py-2.5 text-sm font-semibold z-10">
                    {isActive && (
                      <motion.span
                        layoutId="bubble-pill"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        className="absolute inset-0 rounded-full -z-10"
                        style={{ background: 'linear-gradient(120deg,#6C3CE9,#FF3D81)' }}
                      />
                    )}
                    <span className={isActive ? 'text-white' : 'text-ink/70 hover:text-ink transition-colors'}>{link.label}</span>
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right actions bubble */}
          <div className="flex items-center bg-white/80 backdrop-blur-xl border border-white/60 rounded-full px-2 py-2 shadow-[0_8px_30px_rgba(108,60,233,0.15)]">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 8 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-violet/10 transition-colors"
            >
              <IoSearchOutline className="w-[18px] h-[18px] text-ink" />
            </motion.button>

            <div onClick={() => navigate("/cart")} className="relative" aria-label="Cart">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -8 }}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-violet/10 transition-colors"
              >
                <IoCartOutline className="w-[18px] h-[18px] text-ink" />
              </motion.div>
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.3, 1] }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute -top-0.5 -right-0.5 text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#FF3D81,#FF6B4A)' }}
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(isLoggedIn ? (user.role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/login')}
              className="hidden md:flex items-center gap-1.5 text-white px-4 py-2 rounded-full text-sm font-semibold"
              style={{ background: 'linear-gradient(120deg,#6C3CE9,#FF3D81)' }}
            >
              <IoPersonOutline className="w-4 h-4" />
              {isLoggedIn ? 'You' : 'Sign in'}
            </motion.button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-violet/10 transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <IoClose className="w-5 h-5 text-ink" /> : <IoMenu className="w-5 h-5 text-ink" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu — full-bleed colorful sheet */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.25 }}
            className="fixed top-20 left-4 right-4 z-40 lg:hidden bg-white/95 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl overflow-hidden"
          >
            <div className="p-3 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => `px-5 py-3.5 rounded-2xl font-semibold text-sm transition-colors ${isActive ? 'text-white' : 'text-ink hover:bg-violet/5'}`}
                  style={({ isActive }) => (isActive ? { background: `linear-gradient(120deg, ${VIVID[i % VIVID.length]}, ${VIVID[(i + 1) % VIVID.length]})` } : undefined)}
                >
                  {link.label}
                </NavLink>
              ))}
              {!isLoggedIn && (
                <button
                  onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                  className="mt-1 text-white py-3.5 rounded-2xl font-semibold text-sm"
                  style={{ background: 'linear-gradient(120deg,#6C3CE9,#FF3D81)' }}
                >
                  Sign in
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/50 backdrop-blur-md z-[60] flex items-start justify-center pt-28 px-4"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className="w-full max-w-2xl bg-white rounded-[28px] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearch} className="flex items-center px-6 py-2">
                <IoSearchOutline className="w-5 h-5 flex-shrink-0" style={{ color: '#6C3CE9' }} />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books, authors, vibes..."
                  className="flex-1 px-4 py-5 bg-transparent border-none outline-none text-ink placeholder-ink/40 font-serif text-lg"
                />
                <button type="button" onClick={() => setIsSearchOpen(false)} className="text-xs font-semibold text-ink/50 px-3 py-1.5 bg-ink/5 rounded-full">
                  ESC
                </button>
              </form>
              {categories.length > 0 && (
                <div className="px-5 pb-5 flex flex-wrap gap-2">
                  {categories.slice(0, 6).map((cat) => (
                    <motion.button
                      key={cat.path}
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setSearchQuery(cat.label)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white"
                      style={{ background: cat.tint }}
                    >
                      {cat.label}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-24" />
    </>
  );
};

export default Navbar;