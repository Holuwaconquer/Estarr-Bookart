import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiRefresh, HiClock, HiCash, HiShieldCheck, HiMail } from 'react-icons/hi';

const ReturnsPolicy = () => {
  useEffect(() => {
    document.title = 'Returns Policy | EStarr Bookart Hub';
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <div className="relative text-black py-16">
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <div className="inline-flex p-3 bg-white/20 rounded-2xl mb-6">
              <HiRefresh className="w-12 h-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Returns & Refunds Policy</h1>
            <p className="text-xl text-gray-600">30-Day Money-Back Guarantee</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <HiClock className="w-10 h-10 text-green-600 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-800">30 Days Returns</h3>
                  <p className="text-sm text-gray-600">Return items within 30 days of delivery</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <HiShieldCheck className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-800">Original Condition</h3>
                  <p className="text-sm text-gray-600">Items must be unused and in original packaging</p>
                </div>
                <div className="text-center p-4 bg-cyan-50 rounded-xl">
                  <HiCash className="w-10 h-10 text-cyan-600 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-800">Full Refund</h3>
                  <p className="text-sm text-gray-600">Full refund to original payment method</p>
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Return Eligibility</h2>
                <p>To be eligible for a return, your item must be:</p>
                <ul>
                  <li>In the same condition that you received it</li>
                  <li>Unused and unmarked</li>
                  <li>In the original packaging with all tags attached</li>
                  <li>Returned within 30 days of delivery date</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Non-Returnable Items</h2>
                <p>The following items cannot be returned:</p>
                <ul>
                  <li>Digital products (e-books, audiobooks)</li>
                  <li>Gift cards</li>
                  <li>Downloadable software</li>
                  <li>Items marked as "Final Sale"</li>
                  <li>Personalized or customized items</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">How to Initiate a Return</h2>
                <ol className="list-decimal pl-5">
                  <li>Contact our customer service at returns@estarrbookart.com with your order number</li>
                  <li>Provide the reason for return and photos if item is damaged</li>
                  <li>Wait for return authorization and instructions</li>
                  <li>Package the item securely in original packaging</li>
                  <li>Ship the item to the address provided</li>
                  <li>Keep your shipping receipt for tracking</li>
                </ol>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Refund Process</h2>
                <p>Once we receive your return:</p>
                <ul>
                  <li>We will inspect the item within 3-5 business days</li>
                  <li>Approved returns will be refunded to original payment method</li>
                  <li>Refunds typically take 5-10 business days to appear in your account</li>
                  <li>You will receive email confirmation when refund is processed</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Damaged or Defective Items</h2>
                <p>If you receive a damaged or defective item:</p>
                <ul>
                  <li>Contact us within 48 hours of delivery</li>
                  <li>Provide photos of the damage</li>
                  <li>We will cover return shipping costs</li>
                  <li>Replacement or full refund will be provided immediately</li>
                </ul>

                <div className="bg-gray-50 p-6 rounded-xl mt-8">
                  <div className="flex items-start gap-4">
                    <HiMail className="w-8 h-8 text-cyan-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">Questions About Returns?</h3>
                      <p className="text-gray-600">Contact our returns team:</p>
                      <p className="text-gray-600">Email: returns@estarrbookart.com</p>
                      <p className="text-gray-600">Phone: +234 (0) 123 456 7890</p>
                      <p className="text-gray-600 text-sm mt-2">Hours: Monday-Friday, 9 AM - 5 PM (WAT)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg mt-8">
                  <p className="text-amber-800 text-sm">
                    <strong>Note:</strong> Original shipping fees are non-refundable unless the return is due to our error. Return shipping costs are the responsibility of the customer unless the item is defective or incorrect.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReturnsPolicy;