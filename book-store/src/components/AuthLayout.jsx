// components/AuthLayout.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiSparkles } from 'react-icons/hi';

const AuthLayout = ({ children, title, subtitle, logo = true }) => {
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setMousePosition({
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-indigo-950 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden"
    >
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div
          className="absolute w-[600px] h-[600px] bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.3s ease-out'
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
          style={{
            left: `${100 - mousePosition.x}%`,
            top: `${100 - mousePosition.y}%`,
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.3s ease-out'
          }}
        />
      </div>

      {/* Logo */}
      {logo && (
        <Link to="/" className="absolute top-6 left-6 z-20">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-white rounded p-2 flex items-center justify-center">
              <img 
                src="/estarr-logo.png" 
                className='w-full h-full object-contain drop-shadow-lg' 
                alt="Estarr BookArt" 
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Estarr BookArt
              </h1>
            </div>
          </motion.div>
        </Link>
      )}

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-white mb-2"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400"
          >
            {subtitle}
          </motion.p>
        </motion.div>

        {children}

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <Link
            to="/"
            className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
          >
            ← Go Back Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;