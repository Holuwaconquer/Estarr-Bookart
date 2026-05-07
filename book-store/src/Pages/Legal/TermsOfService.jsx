import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiDocumentText, HiScale, HiCreditCard, HiTruck, HiShieldCheck, HiUserGroup } from 'react-icons/hi';
import useCanonicalUrl from '../../../useCanonicalUrl';

const TermsOfService = () => {
  useCanonicalUrl();
  useEffect(() => {
    document.title = 'Terms of Service | EStarr Bookart Hub';
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      icon: HiDocumentText,
      title: 'Agreement to Terms',
      content: `By accessing our website and making purchases, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.`
    },
    {
      icon: HiUserGroup,
      title: 'Account Registration',
      content: `To place orders, you may need to create an account. You are responsible for:
        • Maintaining the confidentiality of your account credentials
        • All activities that occur under your account
        • Providing accurate and complete information
        • Notifying us immediately of any unauthorized use
        We reserve the right to refuse service, terminate accounts, or cancel orders at our sole discretion.`
    },
    {
      icon: HiCreditCard,
      title: 'Pricing and Payments',
      content: `All prices are listed in Nigerian Naira (₦) and include applicable taxes unless otherwise noted. We reserve the right to change prices at any time without notice. Payment must be received in full before order processing. We accept:
        • Bank transfers
        • Card payments (via secure payment gateway)
        • Manual bank transfers with proof of payment
        We do not store your payment information on our servers.`
    },
    {
      icon: HiTruck,
      title: 'Shipping and Delivery',
      content: `We ship to addresses within Nigeria. Delivery times are estimates and not guaranteed. We are not responsible for:
        • Delivery delays caused by shipping carriers
        • Incorrect addresses provided by customers
        • Lost or stolen packages after delivery confirmation
        • Customs duties or taxes (if applicable)
        Please refer to our Shipping Information page for detailed policies.`
    },
    {
      icon: HiScale,
      title: 'Returns and Refunds',
      content: `We want you to be satisfied with your purchase. Please review our Returns Policy for detailed information about:
        • Return eligibility and timeframes
        • Condition requirements for returns
        • Refund processing times
        • Non-returnable items
        • Return shipping costs
        Some items may be final sale and cannot be returned.`
    },
    {
      icon: HiShieldCheck,
      title: 'Intellectual Property',
      content: `All content on this website, including text, graphics, logos, images, and software, is the property of EStarr Bookart Hub and protected by Nigerian and international copyright laws. You may not:
        • Republish, distribute, or reproduce our content without permission
        • Use our trademarks or logos without authorization
        • Scrape or copy product information for commercial use
        • Modify or create derivative works from our content`
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <div className="relative text-black py-4">
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <div className="inline-flex p-3 bg-white/20 rounded-2xl mb-6">
              <HiDocumentText className="w-12 h-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-gray-600">Last updated: May 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
                <p className="text-amber-800 text-sm">
                  <strong>Important:</strong> These terms of service constitute a legally binding agreement between you and EStarr Bookart Hub. By using our services, you acknowledge that you have read, understood, and agree to be bound by these terms.
                </p>
              </div>

              <div className="space-y-8">
                {sections.map((section, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border-b border-gray-200 last:border-0 pb-6 last:pb-0"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                        <section.icon className="w-6 h-6 text-cyan-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">{section.title}</h2>
                    </div>
                    <div className="pl-16">
                      {section.content.split('\n').map((paragraph, i) => (
                        paragraph.trim() && (
                          <p key={i} className="text-gray-600 leading-relaxed mb-3 whitespace-pre-line">
                            {paragraph.trim().startsWith('•') ? (
                              <span className="block ml-4">{paragraph}</span>
                            ) : paragraph}
                          </p>
                        )
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">
                  If you have any questions about these Terms, please contact us at legal@estarrbookart.com.ng We reserve the right to modify these terms at any time. Continued use of the site after changes constitutes acceptance of the modified terms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;