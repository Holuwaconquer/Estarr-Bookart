import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiPhone, HiX } from 'react-icons/hi';
import { FiUsers, FiMessageCircle } from 'react-icons/fi';
import { MdStorefront } from 'react-icons/md';

const HeroRightSidebar = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');

  const openModal = (title) => {
    setModalTitle(title);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="w-full h-[450px] flex flex-col gap-4">
      {/* Top Section - Call to Order, Sell, Join Club */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex bg-white rounded-[4px] shadow-lg overflow-hidden"
      >
        <div className="h-full flex flex-col p-6 justify-between">
          {/* Call to Order */}
          <div className="flex items-center gap-4 border-gray-200">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-orange-100">
                <HiPhone className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[16px] font-bold text-gray-900 uppercase tracking-wide">
                Call to Order
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600 hover:text-orange-600 transition-colors cursor-pointer">
                  +234 814 515 7410
                </p>
                <p className="text-sm text-gray-600 hover:text-orange-600 transition-colors cursor-pointer">
                  +234 903 255 5739
                </p>
              </div>
            </div>
          </div>

          {/* Sell on Estarr BookArt */}
          <motion.div
            onClick={() => openModal('Sell on Estarr BookArt')}
            className="flex items-center gap-4 py-4 cursor-pointer transition-colors px-0"
          >
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100">
                <MdStorefront className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                Sell on Estarr BookArt
              </p>
            </div>
          </motion.div>

          {/* Join a Book Club */}
          <motion.div
            onClick={() => openModal('Join a Book Club')}
            className="flex items-center gap-4 cursor-pointer transition-colors px-0"
          >
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-100">
                <FiUsers className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                Join a Book Club
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Section - Order on WhatsApp */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 rounded-[4px] shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow group"
      >
        <div className="h-full flex items-center justify-center px-6">
          <div className="text-center text-white">
            <div className="flex items-center justify-center ">
              <FiMessageCircle className="h-8 w-8 group-hover:scale-110 transition-transform" />
              <span className="text-lg font-bold">Order on WhatsApp</span>
            </div>
            <p className="text-sm text-green-100">Chat with us now for quick assistance</p>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalTitle}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HiX className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Features coming soon
            </p>
            <button
              onClick={closeModal}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HeroRightSidebar;
