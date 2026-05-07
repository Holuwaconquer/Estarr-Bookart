import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiShieldCheck, HiLockClosed, HiMail, HiDatabase, HiEyeOff } from 'react-icons/hi';
import useCanonicalUrl from '../../../useCanonicalUrl';

const PrivacyPolicy = () => {
  useCanonicalUrl()
  useEffect(() => {
    document.title = 'Privacy Policy | EStarr Bookart Hub';
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      icon: HiShieldCheck,
      title: 'Information We Collect',
      content: `We collect information you provide directly to us, such as when you create an account, place an order, or contact us. This may include:
        • Name and contact information (email, phone number, address)
        • Payment information (processed securely through our payment partners)
        • Account credentials (username and password)
        • Communication preferences
        • Order history and preferences`
    },
    {
      icon: HiDatabase,
      title: 'How We Use Your Information',
      content: `We use the information we collect to:
        • Process and fulfill your orders
        • Communicate with you about your orders and account
        • Send you marketing communications (with your consent)
        • Improve our website and services
        • Prevent fraudulent transactions
        • Comply with legal obligations`
    },
    {
      icon: HiLockClosed,
      title: 'Data Security',
      content: `We implement appropriate technical and organizational measures to protect your personal information. This includes:
        • SSL/TLS encryption for all data transmission
        • Secure payment processing through PCI-compliant partners
        • Regular security assessments and updates
        • Limited access to personal data by authorized personnel only
        • Secure storage of sensitive information`
    },
    {
      icon: HiEyeOff,
      title: 'Cookies and Tracking',
      content: `We use cookies and similar tracking technologies to:
        • Remember your preferences and login status
        • Analyze website traffic and usage patterns
        • Personalize your shopping experience
        • Provide social media features
        You can control cookie settings through your browser preferences.`
    },
    {
      icon: HiEyeOff,
      title: 'Your Rights',
      content: `You have the right to:
        • Access your personal information
        • Correct inaccurate information
        • Request deletion of your data
        • Opt-out of marketing communications
        • Data portability
        • Lodge a complaint with supervisory authorities
        To exercise these rights, please contact us at privacy@estarrbookart.com`
    },
    {
      icon: HiMail,
      title: 'Contact Us',
      content: `If you have questions about this Privacy Policy or our data practices, please contact us at:
        • Email: privacy@estarrbookart.com
        • Phone: +234 (0) 123 456 7890
        • Address: EStarr Bookart Hub, OAU, Ile-Ife, Osun State, Nigeria`
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <div className="relative text-black py-4">
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <div className="inline-flex p-3 bg-white/20 rounded-2xl mb-6">
              <HiShieldCheck className="w-12 h-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-gray-600">Last updated: May 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8 md:p-12">
              <p className="text-gray-600 mb-8 leading-relaxed">
                At EStarr Bookart Hub, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make purchases from us. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
              </p>

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
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;