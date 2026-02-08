import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiFire, HiClock } from 'react-icons/hi';
import { bookAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FaTags } from "react-icons/fa6";

const FlashDeals = () => {
  const [deals, setDeals] = useState([]);
  const [timeLeft, setTimeLeft] = useState({
    hours: 24,
    minutes: 0,
    seconds: 0
  });
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;
  // Fetch flash deals from backend
  useEffect(() => {
    const fetchFlashDeals = async () => {
      try {
        setLoading(true);
        console.log('🔥 Fetching flash deals from:', `${API_URL}/api/books/flash/deals?limit=4`);
        
        const response = await fetch(`${API_URL}/api/books/flash/deals?limit=4`);
        console.log('📦 Flash deals response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Flash deals result:', result);
        
        if (result.success && result.data && result.data.length > 0) {
          console.log('📊 Flash deals count:', result.data.length);
          const flashDeals = result.data.map((book) => ({
            id: book._id,
            title: book.title,
            discount: book.discount || 0,
            price: book.price,
            originalPrice: book.originalPrice || (book.discount ? book.price / (1 - book.discount / 100) : book.price),
            image: book.image
          }));
          
          setDeals(flashDeals);
        } else {
          console.warn('⚠️ No flash deals from API, using fallback');
          throw new Error('No flash deals found');
        }
      } catch (error) {
        console.error('❌ Error fetching flash deals:', error);
        console.log('📌 Using fallback static data');
        setDeals([
          { 
            id: 1, 
            discount: 50, 
            title: 'Bestseller Bundle', 
            price: 4500,
            originalPrice: 9000,
            image: 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?q=80&w=500',
          },
          { 
            id: 2, 
            discount: 45, 
            title: 'Romance Collection', 
            price: 5500,
            originalPrice: 10000,
            image: 'https://images.unsplash.com/photo-1502933691298-84fc14542831?q=80&w=500',
          },
          { 
            id: 3, 
            discount: 60, 
            title: 'Sci-Fi Pack', 
            price: 3999,
            originalPrice: 9999,
            image: 'https://images.unsplash.com/photo-1543002588-d4d13a6f2e5f?q=80&w=500',
          },
          { 
            id: 4, 
            discount: 35, 
            title: 'Biography Set', 
            price: 6499,
            originalPrice: 9999,
            image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=500',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashDeals();
  }, [API_URL]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          hours = 24;
          minutes = 0;
          seconds = 0;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (value) => String(value).padStart(2, '0');

  if (loading) {
    return (
      <div className="py-8 px-4 bg-gradient-to-r from-red-500 to-orange-500">
        <div className="max-w-7xl mx-auto">
          <div className="h-48 bg-white/20 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <section className="py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-[4px]">
          {/* Header */}
          <div className="bg-gradient-to-r p-4 rounded-tr-[4px] rounded-tl-[4px] from-red-500 to-orange-500 flex md:flex-row flex-wrap items-center justify-between md:gap-6 mb-6">
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
                <p className="md:text-2xl text-white/90">Ends In:</p>
                <div className="flex gap-2">
                  <div className="">
                    <span className="text-[18px] md:text-2xl font-bold text-white">{formatTime(timeLeft.hours)}h :</span>
                  </div>
                  <div className="">
                    <span className="text-[18px] md:text-2xl font-bold text-white">{formatTime(timeLeft.minutes)}m :</span>
                  </div>
                  <div className="">
                    <span className="text-[18px] md:text-2xl font-bold text-white">{formatTime(timeLeft.seconds)}s</span>
                  </div>
                </div>
              </div>
            </div>

            <Link 
              to="/category?filter=discount" 
              className="bg-white py-2 px-4 text-red-600 rounded-[4px] font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              View All
            </Link>
          </div>

          {/* Deal Cards */}
          <div className="flex overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-[32px] md:overflow-visible">
            {deals.map((deal) => (
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
                      <p className="text-xs text-gray/70">Ends in {formatTime(timeLeft.hours)}h :{formatTime(timeLeft.minutes)}m :{formatTime(timeLeft.seconds)}s</p>
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
