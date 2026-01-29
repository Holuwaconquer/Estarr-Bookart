import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiStar, HiChevronLeft, HiChevronRight, HiSparkles, HiUserGroup, HiShieldCheck, HiTruck, HiHeart } from 'react-icons/hi';

const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      id: 1,
      text: "The limited edition of Dune arrived in exquisite packaging. The attention to detail is unmatched. This isn't just a book, it's a piece of art for my collection.",
      author: "Alexander R.",
      role: "Book Collector & Investor",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      collection: "42 Rare Books"
    },
    {
      id: 2,
      text: "As a librarian, I've seen countless editions. Estarr's curation is exceptional. Their authentication process gives me complete confidence in every purchase.",
      author: "Dr. Eleanor Vance",
      role: "Head Librarian, Oxford",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
      collection: "18th Century Specialist"
    },
    {
      id: 3,
      text: "The customer service team helped me find a first edition I've been searching for years. Their knowledge and dedication are remarkable for collectors.",
      author: "James Chen",
      role: "Rare Book Collector",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
      collection: "500+ Volume Library"
    },
    {
      id: 4,
      text: "From ordering to delivery, every step felt premium. The packaging alone is worth the price. My collection has found its new exclusive home.",
      author: "Sophia Williams",
      role: "Literature Professor",
      rating: 5,
      image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&h=200&fit=crop&crop=face",
      collection: "Modern First Editions"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-indigo-950/30 to-purple-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">

          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
              Trusted by Collectors
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Hear from distinguished collectors, librarians, and bibliophiles who trust Estarr for rare editions
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-800/50 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Testimonial Content */}
                <div className="p-8 lg:p-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex gap-1">
                      {[...Array(testimonials[currentSlide].rating)].map((_, i) => (
                        <HiStar key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-400">Verified Collector</span>
                  </div>
                  
                  <blockquote className="text-2xl lg:text-3xl font-light text-white mb-8 leading-relaxed">
                    "{testimonials[currentSlide].text}"
                  </blockquote>

                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 p-0.5">
                        <img 
                          src={testimonials[currentSlide].image} 
                          alt={testimonials[currentSlide].author}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                        <HiSparkles className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">
                        {testimonials[currentSlide].author}
                      </div>
                      <div className="text-gray-400 mb-2">
                        {testimonials[currentSlide].role}
                      </div>
                      <div className="text-sm text-cyan-400">
                        {testimonials[currentSlide].collection}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Sidebar */}
                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-8 lg:p-12 flex flex-col justify-center border-l border-gray-800/50">
                  <div className="space-y-8">
                    {[
                      { value: "98%", label: "Collector Satisfaction", sub: "Based on 2,000+ verified reviews", icon: HiHeart, color: "from-red-500 to-pink-500" },
                      { value: "4.9/5", label: "Average Rating", sub: "Across all platforms & reviews", icon: HiStar, color: "from-amber-500 to-orange-500" },
                      { value: "24hr", label: "Response Time", sub: "For collector inquiries", icon: HiUserGroup, color: "from-cyan-500 to-blue-500" },
                      { value: "100%", label: "Authenticity", sub: "All books certified & verified", icon: HiShieldCheck, color: "from-emerald-500 to-green-500" }
                    ].map((stat, index) => (
                      <div key={index} className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {stat.value}
                          </div>
                          <div className="text-lg font-semibold text-white">
                            {stat.label}
                          </div>
                          <div className="text-sm text-gray-400">
                            {stat.sub}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-12">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={prevSlide}
              className="p-3 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-purple-500/30 transition-all backdrop-blur-sm"
            >
              <HiChevronLeft className="w-6 h-6 text-gray-300 hover:text-purple-400 transition-colors" />
            </motion.button>
            
            {/* Dots */}
            <div className="flex items-center gap-3">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setCurrentSlide(index)}
                  className={`rounded-full transition-all ${
                    currentSlide === index
                      ? 'w-12 h-2 bg-gradient-to-r from-purple-500 to-pink-500'
                      : 'w-2 h-2 bg-gray-700 hover:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextSlide}
              className="p-3 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-800 hover:border-purple-500/30 transition-all backdrop-blur-sm"
            >
              <HiChevronRight className="w-6 h-6 text-gray-300 hover:text-purple-400 transition-colors" />
            </motion.button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { text: "Secure Transactions", sub: "256-bit SSL encryption" },
            { text: "Global Shipping", sub: "150+ countries served" },
            { text: "Premium Packaging", sub: "Climate-controlled delivery" },
            { text: "Expert Verification", sub: "All books authenticated" }
          ].map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-800/50 text-center"
            >
              <div className="text-lg font-semibold text-white mb-2">{badge.text}</div>
              <div className="text-sm text-gray-400">{badge.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;