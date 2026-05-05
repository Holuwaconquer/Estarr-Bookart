import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiTruck, HiClock, HiCash, HiShieldCheck, HiMap } from 'react-icons/hi';
import useCanonicalUrl from '../../useCanonicalUrl';

const ShippingInfo = () => {
  useCanonicalUrl()
  useEffect(() => {
    document.title = 'Shipping Information | EStarr Bookart Hub';
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <div className="relative text-black py-16">
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <div className="inline-flex p-3 bg-white/20 rounded-2xl mb-6">
              <HiTruck className="w-12 h-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Shipping Information</h1>
            <p className="text-xl text-gray-600">Fast & Reliable Delivery Across Nigeria</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-green-50 p-6 rounded-xl text-center">
                  <HiCash className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-2xl font-bold text-gray-800">Free Shipping</h3>
                  <p className="text-gray-600">On orders over ₦5,000</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-xl text-center">
                  <HiClock className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-2xl font-bold text-gray-800">Fast Delivery</h3>
                  <p className="text-gray-600">2-5 business days nationwide</p>
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Shipping Destinations</h2>
                <p>We currently ship to all states within Nigeria. International shipping is not available at this time.</p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Shipping Rates</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border p-3 text-left">Order Value</th>
                        <th className="border p-3 text-left">Shipping Fee</th>
                        <th className="border p-3 text-left">Estimated Delivery</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-3">Below ₦5,000</td>
                        <td className="border p-3">₦1,500</td>
                        <td className="border p-3">3-7 business days</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border p-3">₦5,000 - ₦20,000</td>
                        <td className="border p-3">Free</td>
                        <td className="border p-3">2-5 business days</td>
                      </tr>
                      <tr>
                        <td className="border p-3">Above ₦20,000</td>
                        <td className="border p-3">Free + Priority</td>
                        <td className="border p-3">1-3 business days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Delivery Timeframes</h2>
                <ul>
                  <li><strong>Lagos, Abuja, Port Harcourt:</strong> 1-3 business days</li>
                  <li><strong>Other State Capitals:</strong> 3-5 business days</li>
                  <li><strong>Remote Areas:</strong> 5-7 business days</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Order Processing</h2>
                <p>Orders are processed within 1-2 business days after payment confirmation. You will receive:</p>
                <ul>
                  <li>Order confirmation email immediately after purchase</li>
                  <li>Processing confirmation within 24 hours</li>
                  <li>Shipping notification with tracking number when order ships</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Tracking Your Order</h2>
                <p>Once your order ships, you will receive a tracking number via email. You can track your package:</p>
                <ul>
                  <li>Through the courier's website</li>
                  <li>In your account dashboard under "My Orders"</li>
                  <li>By contacting our customer service</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Delivery Issues</h2>
                <p>If you experience any delivery issues:</p>
                <ul>
                  <li><strong>Delayed delivery:</strong> Contact us after the estimated delivery date</li>
                  <li><strong>Damaged package:</strong> Document with photos and contact within 48 hours</li>
                  <li><strong>Wrong item:</strong> Do not open packaging, contact immediately</li>
                  <li><strong>Missing items:</strong> Check package thoroughly, then contact us</li>
                </ul>

                <div className="bg-gray-50 p-6 rounded-xl mt-8">
                  <div className="flex items-start gap-4">
                    <HiMap className="w-8 h-8 text-cyan-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">Delivery Address</h3>
                      <p className="text-gray-600">Please ensure your shipping address is correct at checkout. We are not responsible for deliveries to incorrect addresses provided by customers. Additional shipping fees may apply for address corrections.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl mt-8">
                  <h3 className="font-bold text-gray-800 mb-2">Questions About Shipping?</h3>
                  <p className="text-gray-600">Contact our shipping team:</p>
                  <p className="text-gray-600">Email: shipping@estarrbookart.com</p>
                  <p className="text-gray-600">Phone: +234 (0) 123 456 7890</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShippingInfo;