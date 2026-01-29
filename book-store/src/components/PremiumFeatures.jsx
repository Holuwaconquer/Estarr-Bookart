import React from 'react';
import { HiShieldCheck, HiTruck, HiGift } from 'react-icons/hi2';

const PremiumFeatures = () => {
  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            The <span className="text-purple-600">Premium</span> Difference
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We deliver more than just books - we deliver an experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <div className="inline-flex p-4 bg-purple-100 rounded-2xl mb-6">
              <HiShieldCheck className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Authenticity Guaranteed</h3>
            <p className="text-gray-600">Every book comes with certificate of authenticity.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <div className="inline-flex p-4 bg-purple-100 rounded-2xl mb-6">
              <HiTruck className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">White-Glove Shipping</h3>
            <p className="text-gray-600">Premium packaging with tracking and insurance.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <div className="inline-flex p-4 bg-purple-100 rounded-2xl mb-6">
              <HiGift className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Curation</h3>
            <p className="text-gray-600">Hand-picked by our team of book experts.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumFeatures;