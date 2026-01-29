import React, { useState } from 'react';
import { HiMail, HiArrowRight, HiSparkles, HiGift, HiStar, HiEye } from 'react-icons/hi';
import { motion } from 'framer-motion';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitted(true);
    setEmail('');
    
    // Reset after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setIsSubmitting(false);
    }, 5000);
  };

  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent" />
          
          {/* Border Glow */}
          <div className="absolute inset-0 rounded-3xl border border-transparent bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 p-[1px]">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gray-950 via-blue-950 to-indigo-950" />
          </div>

          <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-12 p-8 lg:p-12">
            {/* Left Content */}
            <div className="text-white">

              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Join the{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Collector's Circle
                </span>
              </h2>
              
              <p className="text-gray-300 mb-8 leading-relaxed">
                Get first access to limited editions, exclusive offers, and curated collections from our premium catalog.
                Be among the first to discover rare finds and special releases reserved for our inner circle.
              </p>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: HiGift, text: 'Exclusive member discounts', color: 'from-purple-500 to-pink-500' },
                  { icon: HiStar, text: 'First access to limited editions', color: 'from-amber-500 to-orange-500' },
                  { icon: HiSparkles, text: 'Curated monthly recommendations', color: 'from-cyan-500 to-blue-500' },
                  { icon: HiEye, text: 'Early sale notifications', color: 'from-emerald-500 to-green-500' }
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${benefit.color} flex items-center justify-center`}>
                      <benefit.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Form */}
            <div className="flex flex-col justify-center">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center p-8 rounded-2xl bg-gradient-to-br from-emerald-900/20 to-green-900/20 border border-emerald-500/30"
                >
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Welcome to the Circle!</h3>
                  <p className="text-gray-300 mb-6">
                    You're now part of our exclusive collector's community. Check your email for a special welcome gift.
                  </p>
                  <div className="text-sm text-emerald-400">
                    Special offer sent to: <span className="font-mono">{email}</span>
                  </div>
                </motion.div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-white mb-6">
                    Subscribe to Our Newsletter
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <HiMail className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Subscribing...</span>
                        </>
                      ) : (
                        <>
                          <span>Join Exclusive Circle</span>
                          <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </motion.button>

                    <div className="text-center">
                      <p className="text-sm text-gray-400">
                        By subscribing, you agree to our{' '}
                        <a href="#" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</a>.
                        <br />
                        <span className="text-xs">No spam. Unsubscribe anytime.</span>
                      </p>
                    </div>
                  </form>

                  {/* Subscription Stats */}
                  <div className="mt-8 pt-8 border-t border-gray-800/50">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                          15K+
                        </div>
                        <div className="text-xs text-gray-400">Collectors</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          98%
                        </div>
                        <div className="text-xs text-gray-400">Satisfaction</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                          Weekly
                        </div>
                        <div className="text-xs text-gray-400">Updates</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;