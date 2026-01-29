import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const PromoBarContext = createContext();

const PromoBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { setPromoBarVisible } = useContext(PromoBarContext) || {};

  const promos = [
    "🚚 Free shipping on orders above ₦5,000",
    "⚡ Flash deals ending soon!",
    "🎁 Free gift with every purchase above ₦10,000",
    "💳 Pay on delivery available nationwide"
  ];

  const [currentPromo, setCurrentPromo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % promos.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setPromoBarVisible?.(false);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white py-2 px-4 fixed top-0 left-0 right-0 z-50 shadow-lg"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 text-center min-w-0">
          <motion.p
            key={currentPromo}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-xs md:text-sm font-semibold whitespace-nowrap md:whitespace-normal overflow-hidden text-ellipsis"
          >
            {promos[currentPromo]}
          </motion.p>
        </div>
        <button
          onClick={handleClose}
          className="text-white/70 hover:text-white transition-colors flex-shrink-0"
          aria-label="Close promo bar"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};

export default PromoBar;
