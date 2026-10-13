import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiFire } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { FaTags } from "react-icons/fa6";

const FlashDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const refreshedExpiredDeals = useRef(new Set());
  const API_URL = import.meta.env.VITE_API_URL;
  const fetchFlashDeals = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/books/flash/deals?limit=20`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success || !Array.isArray(result.data)) {
        throw new Error('Invalid flash deals response');
      }

      setDeals(result.data.map((book) => ({
        id: book._id,
        title: book.title,
        discount: book.discount || 0,
        price: book.price,
        originalPrice: book.originalPrice || book.price,
        image: book.image,
        startDate: book.flashSaleStartDate,
        endDate: book.flashSaleEndDate,
      })));
    } catch (error) {
      console.error('❌ Error fetching flash deals:', error);
      toast.error('Failed to load flash deals');
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchFlashDeals();
  }, [fetchFlashDeals]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const activeDeals = deals.filter((deal) => {
    const startsAt = new Date(deal.startDate).getTime();
    const endsAt = new Date(deal.endDate).getTime();
    return Number.isFinite(startsAt) && Number.isFinite(endsAt) &&
      startsAt <= now && endsAt > now;
  });

  useEffect(() => {
    const expiredDeal = deals.find(
      (deal) =>
        new Date(deal.endDate).getTime() <= now &&
        !refreshedExpiredDeals.current.has(deal.id),
    );

    if (expiredDeal) {
      refreshedExpiredDeals.current.add(expiredDeal.id);
      fetchFlashDeals();
    }
  }, [deals, fetchFlashDeals, now]);

  const formatTime = (endDate) => {
    const endsAt = new Date(endDate).getTime();
    if (!Number.isFinite(endsAt)) {
      return '00h :00m :00s';
    }

    const remainingSeconds = Math.max(
      0,
      Math.ceil((endsAt - now) / 1000),
    );
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;
    return `${String(hours).padStart(2, '0')}h :${String(minutes).padStart(2, '0')}m :${String(seconds).padStart(2, '0')}s`;
  };

  const nextEndingDeal = activeDeals.reduce(
    (soonest, deal) =>
      !soonest || new Date(deal.endDate) < new Date(soonest.endDate)
        ? deal
        : soonest,
    null,
  );

  if (loading) {
    return (
      <div className="py-8 px-4 bg-gradient-to-r from-red-500 to-orange-500">
        <div className="max-w-7xl mx-auto">
          <div className="h-48 bg-white/20 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (activeDeals.length === 0) {
    return null;
  }

  return (
    <section className="py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-[4px]">
          {/* Header */}
          <div className="bg-gradient-to-r px-4 py-2 rounded-tr-[4px] rounded-tl-[4px] from-purple-500 to-purple-800 flex md:flex-row flex-wrap items-center justify-between md:gap-6 mb-6">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              >
                <FaTags className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-[17px] font-bold text-white">FLASH DEALS</h2>
                <p className="text-white/90 text-[12px] hidden md:block">Limited time offers ending soon!</p>
              </div>
            </div>
            
            {/* Timer */}
            <div className="flex items-center gap-4">
              <div className="text-center flex items-center gap-2">
                <p className="md:text-2xl text-white/90">
                  {nextEndingDeal?.title} ends in:
                </p>
                <span className="text-[14px] md:text-2xl font-bold text-white">
                  {formatTime(nextEndingDeal?.endDate)}
                </span>
              </div>
            </div>
            {/* 
            <Link 
              to="/category?filter=discount" 
              className="bg-white text-[12px] py-2 px-4 text-red-600 rounded-[4px] font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              View All
            </Link> */}
          </div>

          {/* Deal Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-[32px] md:overflow-visible">
            {activeDeals.map((deal) => (
              <motion.div
                key={deal.id}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-[4px] overflow-hidden shadow-md hover:border-white/50 transition-all cursor-pointer group"
              >
                <Link 
                  to={`/product/${deal.id}`}
                  className="block h-full"
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden bg-white">
                    <img 
                      src={deal.image} 
                      alt={deal.title}
                      className="group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-yellow-400 text-black px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                      -{deal.discount}%
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-black font-semibold text-sm line-clamp-2">
                      {deal.title}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex gap-2 items-center">
                        <span className="text-lg font-bold text-dark">
                          ₦{deal.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray/60 line-through">
                          ₦{Math.round(deal.originalPrice).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray/70">Ends in {formatTime(deal.endDate)}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlashDeals;
