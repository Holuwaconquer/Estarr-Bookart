import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown, HiShoppingBag, HiCreditCard, HiTruck, HiRefresh, HiUser, HiShieldCheck, HiMail } from 'react-icons/hi';

const Faq = () => {
  useEffect(() => {
    document.title = 'FAQ | EStarr Bookart Hub';
    window.scrollTo(0, 0);
  }, []);

  const [openIndex, setOpenIndex] = useState(null);

  const faqCategories = [
    {
      icon: HiShoppingBag,
      title: 'Orders',
      questions: [
        {
          q: 'How do I place an order?',
          a: 'Simply browse our collection, add items to your cart, proceed to checkout, enter your shipping information, choose payment method, and complete your purchase. You will receive an order confirmation email immediately.'
        },
        {
          q: 'Can I modify or cancel my order?',
          a: 'Orders can be modified or cancelled within 1 hour of placement. Contact our customer service immediately with your order number. Once an order is processed for shipping, modifications are not possible.'
        },
        {
          q: 'How do I track my order?',
          a: 'Once your order ships, you will receive a tracking number via email. You can also track your order in your account dashboard under "My Orders".'
        }
      ]
    },
    {
      icon: HiCreditCard,
      title: 'Payments',
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept bank transfers, card payments (Visa, Mastercard, Verve), and manual bank transfers with proof of payment. All payments are processed securely.'
        },
        {
          q: 'Is it safe to use my credit card?',
          a: 'Yes! We use secure payment gateways that are PCI-compliant. Your card information is encrypted and never stored on our servers.'
        },
        {
          q: 'What is manual bank transfer?',
          a: 'You can transfer funds directly to our bank account. After payment, upload your proof of payment in your order page. We will confirm and process your order within 24 hours.'
        }
      ]
    },
    {
      icon: HiTruck,
      title: 'Shipping',
      questions: [
        {
          q: 'How much is shipping?',
          a: 'Shipping is free on orders over ₦5,000. Orders below ₦5,000 incur a ₦1,500 shipping fee. See our Shipping Information page for details.'
        },
        {
          q: 'How long does delivery take?',
          a: 'Delivery typically takes 2-5 business days within Nigeria. Major cities like Lagos, Abuja, and Port Harcourt may receive deliveries in 1-3 days.'
        },
        {
          q: 'Do you ship internationally?',
          a: 'Currently, we only ship to addresses within Nigeria. We plan to expand internationally in the future.'
        }
      ]
    },
    {
      icon: HiRefresh,
      title: 'Returns',
      questions: [
        {
          q: 'What is your return policy?',
          a: 'We offer a 30-day return policy for most items. Products must be unused and in original packaging. See our Returns Policy page for detailed information.'
        },
        {
          q: 'How do I return an item?',
          a: 'Contact our returns team at returns@estarrbookart.com with your order number and reason for return. You will receive instructions on how to proceed.'
        },
        {
          q: 'When will I get my refund?',
          a: 'Refunds are processed within 3-5 business days after we receive and inspect your return. Funds typically appear in your account within 5-10 business days.'
        }
      ]
    },
    {
      icon: HiUser,
      title: 'Account',
      questions: [
        {
          q: 'Do I need an account to order?',
          a: 'You can check out as a guest, but creating an account allows you to track orders, save addresses, view order history, and manage your wishlist.'
        },
        {
          q: 'How do I reset my password?',
          a: 'Click "Forgot Password" on the login page. You will receive a reset link via email. Follow the instructions to create a new password.'
        },
        {
          q: 'How do I update my account information?',
          a: 'Log into your account, go to "My Profile", and update your information. Remember to save changes before leaving the page.'
        }
      ]
    },
    {
      icon: HiShieldCheck,
      title: 'Products',
      questions: [
        {
          q: 'Are your books authentic?',
          a: 'Yes! We source all books directly from verified publishers and authorized distributors. We guarantee 100% authentic products.'
        },
        {
          q: 'Do you sell e-books?',
          a: 'Currently, we focus on physical books. We may introduce digital products in the future.'
        },
        {
          q: 'Can I request a specific book?',
          a: 'Absolutely! Contact us with the book title and author. We will try to source it for you within 2 weeks.'
        }
      ]
    }
  ];

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <div className="relative text-black py-16">
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <div className="inline-flex p-3 bg-white/20 rounded-2xl mb-6">
              <HiChevronDown className="w-12 h-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-600">Find answers to common questions about our bookstore</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {faqCategories.map((category, catIdx) => (
            <motion.div
              key={catIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.1 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-cyan-100 rounded-xl">
                  <category.icon className="w-6 h-6 text-cyan-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{category.title}</h2>
              </div>

              <div className="space-y-4">
                {category.questions.map((item, idx) => {
                  const questionIndex = `${catIdx}-${idx}`;
                  const isOpen = openIndex === questionIndex;
                  
                  return (
                    <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleQuestion(questionIndex)}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-800">{item.q}</span>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <HiChevronDown className="w-5 h-5 text-gray-500" />
                        </motion.div>
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-gray-100"
                          >
                            <div className="p-6 bg-gray-50">
                              <p className="text-gray-600 leading-relaxed">{item.a}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {/* Still Have Questions */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-8 text-center mt-10">
            <HiMail className="w-12 h-12 text-cyan-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Still Have Questions?</h3>
            <p className="text-gray-600 mb-6">We're here to help! Contact our customer support team.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@estarrbookart.com"
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                Email Support
              </a>
              <a
                href="/contact"
                className="px-6 py-3 border-2 border-cyan-600 text-cyan-600 rounded-lg font-semibold hover:bg-cyan-50 transition"
              >
                Contact Form
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Faq;