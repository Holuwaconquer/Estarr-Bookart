import React from 'react';
import { motion } from 'framer-motion';

export const Fallback3D = () => (
  <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-3xl overflow-hidden">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-64 h-80">
        <motion.div
          animate={{
            rotateY: [0, 20, 0],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative w-full h-full"
        >
          {/* Book cover */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-2xl" />
          {/* Book spine */}
          <div className="absolute -left-4 top-1/4 w-8 h-1/2 bg-gradient-to-r from-blue-800 to-indigo-900 rounded-l" />
          {/* Pages effect */}
          <div className="absolute inset-2 bg-gradient-to-r from-gray-100 to-gray-300 rounded-lg" />
          {/* Shine effect */}
          <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-white/30 blur-sm" />
        </motion.div>
      </div>
    </div>
  </div>
);