import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { FiPercent } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import toast from 'react-hot-toast';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const HeroFlashDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swiperRef, setSwiperRef] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/books/flash/deals?limit=8');
        const result = await response.json();
        
        if (result.success && result.data) {
          setDeals(result.data);
        } else {
          throw new Error('No deals found');
        }
      } catch (error) {
        console.error('Error fetching flash deals:', error);
        // Fallback: get any books with discounts
        try {
          const response = await fetch('http://localhost:5000/api/books?limit=8');
          const result = await response.json();
          if (result.data?.books) {
            const dealsWithDiscount = result.data.books.filter(b => b.discount > 0);
            setDeals(dealsWithDiscount.slice(0, 8));
          }
        } catch (e) {
          console.error('Fallback failed:', e);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  if (loading) {
    return (
      <div className="relative h-72 bg-gradient-to-r from-orange-500 to-red-500 animate-pulse rounded-lg" />
    );
  }

  if (deals.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[250px] md:h-[450px]">
      {/* Navigation Buttons */}
      <button
        onClick={() => swiperRef?.slidePrev()}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-colors hover:scale-110"
      >
        <HiChevronLeft className="w-6 h-6 text-gray-700" />
      </button>
      <button
        onClick={() => swiperRef?.slideNext()}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-colors hover:scale-110"
      >
        <HiChevronRight className="w-6 h-6 text-gray-700" />
      </button>

      <div className="w-full h-full overflow-hidden rounded-[4px] shadow-lg">
      <Swiper
        onSwiper={setSwiperRef}
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={true}
        className="w-full h-full"
      >
        {deals.map((deal, idx) => (
          <SwiperSlide key={deal._id || idx} className="w-full h-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative w-full h-full overflow-hidden shadow-2xl cursor-pointer group"
              onClick={() => navigate(`/product/${deal._id}`)}
            >
              {/* Product Image as Background */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${deal.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <span className="text-white font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to View Details
                </span>
              </div>

              {/* Discount Badge */}
              {deal.discount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 z-10"
                >
                  {deal.discount}%
                </motion.div>
              )}
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
      </div>
    </div>
  );
};

export default HeroFlashDeals;
