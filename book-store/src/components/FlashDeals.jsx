import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiShoppingCart, HiTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { FaTags } from "react-icons/fa6";
import { useCart } from '../contexts/CartContext';
import { getResponsiveImageSrcSet } from '../utils/imageOptimization';

const FlashDeals = () => {
  const { cart, addToCart, removeFromCart } = useCart();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingDealId, setPendingDealId] = useState(null);
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
        author: book.author,
        discount: book.discount || 0,
        price: book.price,
        originalPrice: book.originalPrice || book.price,
        finalPrice: book.finalPrice,
        image: book.image,
        description: book.description,
        category: book.category,
        features: book.features,
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

  const handleCartToggle = async (deal, sourceElement) => {
    if (pendingDealId === deal.id) return;

    setPendingDealId(deal.id);
    try {
      const isInCart = cart.some(
        (item) =>
          item.id === deal.id ||
          item._id === deal.id ||
          item.book === deal.id,
      );

      if (isInCart) {
        await removeFromCart(deal.id, sourceElement);
      } else {
        await addToCart(deal, 1, sourceElement);
      }
    } finally {
      setPendingDealId(null);
    }
  };

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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-white md:w-6 md:h-6"
                  aria-label="Timer icon"
                >
                  <circle cx="12" cy="13" r="8" />
                  <path d="M12 9v4l3 2" />
                  <path d="M9 2h6" />
                </svg>
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
            {activeDeals.map((deal) => {
              const isInCart = cart.some(
                (item) =>
                  item.id === deal.id ||
                  item._id === deal.id ||
                  item.book === deal.id,
              );
              const isPending = pendingDealId === deal.id;
              const imageSource = getResponsiveImageSrcSet(deal.image, {
                sizes: '(max-width: 768px) 45vw, 24vw',
              });

              return (
                <motion.div
                  key={deal.id}
                  whileHover={{ scale: 1.05 }}
                  className="flex h-full flex-col bg-white rounded-[4px] overflow-hidden shadow-md hover:border-white/50 transition-all group"
                  data-cart-animation-product
                >
                <Link
                  to={`/product/${deal.id}`}
                  className="flex flex-1 flex-col"
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden bg-white">
                    <img
                      {...(imageSource || {})}
                      src={imageSource?.src || deal.image}
                      alt={deal.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-yellow-400 text-black px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                      -{deal.discount}%
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-black font-semibold text-sm">
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
                  <button
                    type="button"
                    onClick={(event) =>
                      handleCartToggle(deal, event.currentTarget)
                    }
                    disabled={isPending}
                    aria-label={isInCart ? `Remove ${deal.title} from cart` : `Add ${deal.title} to cart`}
                    className={`flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white transition-colors disabled:cursor-wait disabled:opacity-60 ${
                      isInCart
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-purple-700 hover:bg-purple-800'
                    }`}
                  >
                    {isPending ? (
                      'Updating cart...'
                    ) : isInCart ? (
                      <>
                        <HiTrash className="h-4 w-4" />
                        Remove from cart
                      </>
                    ) : (
                      <>
                        <HiShoppingCart className="h-4 w-4" />
                        Add to cart
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlashDeals;
