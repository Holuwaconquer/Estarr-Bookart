import React from 'react';
import { HiArrowRight, HiSparkles } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-purple-50/30 to-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%237c3aed' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '600px'
        }}></div>
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 -left-40 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Premium Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-50 rounded-full mb-6 lg:mb-8"
            >
              <HiSparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">Premium Curated Collection</span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-4 lg:mb-6">
              <span className="block">Discover Rare</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">
                Literary Treasures
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 mb-6 lg:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Exclusive signed editions, luxury bindings, and rare collector's items for the discerning bibliophile.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8 lg:mb-12">
              <Link to="/category">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-500 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  <span>Explore Collection</span>
                  <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              
              <Link to="/category/limited-editions">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto bg-white border-2 border-purple-200 text-purple-600 px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-semibold hover:border-purple-300 hover:bg-purple-50 transition-all duration-300"
                >
                  Limited Editions
                </motion.button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              {[
                { value: '500+', label: 'Rare Editions' },
                { value: '4.9★', label: 'Avg. Rating' },
                { value: 'Global', label: 'Shipping' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-first lg:order-last"
          >
            <div className="relative mx-auto max-w-lg">
              {/* Main Image Container */}
              <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
                <div className="aspect-[4/3] lg:aspect-[5/4] bg-gradient-to-br from-purple-100 to-purple-50 relative overflow-hidden">
                  {/* Book Stack Illustration */}
                  <div className="absolute inset-0 flex items-center justify-center p-4 lg:p-8">
                    <div className="relative w-48 h-64 lg:w-64 lg:h-80">
                      {/* Book 1 */}
                      <div className="absolute left-0 top-0 w-32 h-40 lg:w-40 lg:h-52 bg-gradient-to-br from-purple-600 to-purple-500 rounded-lg shadow-2xl transform rotate-3"></div>
                      
                      {/* Book 2 */}
                      <div className="absolute right-0 top-4 w-36 h-44 lg:w-44 lg:h-56 bg-gradient-to-br from-purple-700 to-purple-600 rounded-lg shadow-2xl transform -rotate-2"></div>
                      
                      {/* Book 3 */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-40 h-48 lg:w-48 lg:h-60 bg-gradient-to-br from-purple-500 to-purple-400 rounded-lg shadow-2xl transform rotate-1"></div>
                      
                      {/* Gold Foil Effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-200/10 to-transparent"></div>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                    <div className="text-xs font-semibold text-purple-600">LIMITED EDITION</div>
                    <div className="text-[10px] text-gray-600">Only 50 copies</div>
                  </div>

                  {/* Floating Elements */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-6 right-6 w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-amber-400 to-amber-300 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <span className="text-white text-sm lg:text-base font-bold">✨</span>
                  </motion.div>
                </div>
              </div>

              {/* Floating Badges */}
              {[
                { text: "Hand-Bound", class: "-left-2 lg:-left-4 top-1/4" },
                { text: "Gold Leaf", class: "-right-2 lg:-right-4 top-1/2" },
                { text: "Signed", class: "left-1/4 -bottom-2 lg:-bottom-4" },
              ].map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className={`absolute ${badge.class} bg-white/90 backdrop-blur-sm px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-semibold text-purple-600 shadow-lg border border-white/50`}
                >
                  {badge.text}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="hidden lg:flex justify-center pb-8"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-gray-500">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center"
          >
            <div className="w-1 h-2 bg-gray-400 rounded-full mt-2"></div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;