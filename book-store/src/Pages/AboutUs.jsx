import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineBookOpen,
  HiOutlineUsers,
  HiOutlineGlobeAlt,
  HiOutlineHeart,
  HiOutlineSparkles,
  HiOutlineLightBulb,
  HiOutlineChartBar,
  HiOutlineAcademicCap,
  HiOutlineMail,
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiChevronRight,
  HiStar,
  HiTruck,
  HiShieldCheck,
  HiClock
} from 'react-icons/hi';
import { FiUsers, FiAward, FiBookOpen, FiTrendingUp } from 'react-icons/fi';
import useCanonicalUrl from '../../useCanonicalUrl';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';

const AboutUs = () => {
  useCanonicalUrl()
  const stats = [
    { icon: FiBookOpen, label: 'Books Available', value: '1,000+', color: 'from-cyan-500 to-blue-500' },
    { icon: FiUsers, label: 'Happy Readers', value: '200+', color: 'from-purple-500 to-pink-500' },
    { icon: FiAward, label: 'Years of Excellence', value: '1', color: 'from-amber-500 to-orange-500' },
    { icon: FiTrendingUp, label: 'Books Sold', value: '365+', color: 'from-green-500 to-emerald-500' },
  ];

  useEffect(() => {
    document.title = 'About Us | EStarr Bookart Hub';
    window.scrollTo(0, 0);

  }, [])
  

  const values = [
    {
      icon: HiOutlineLightBulb,
      title: 'Purpose Driven',
      description: 'We believe every book has the power to ignite purpose and transform lives.',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: HiOutlineHeart,
      title: 'Community Impact',
      description: 'Building a community of readers who grow together and make a difference.',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: HiOutlineAcademicCap,
      title: 'Educational Excellence',
      description: 'Supporting academic growth and lifelong learning through quality books.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: HiOutlineSparkles,
      title: 'Quality Assurance',
      description: 'Curated collection of authentic, high-quality books from trusted sources.',
      color: 'from-purple-500 to-indigo-500'
    }
  ];

  const team = [
    {
      name: 'Esther Adesina',
      role: 'Founder & CEO',
      bio: 'I am EStarr, known as The Book Artist. Creative writer, passionate about fostering the reading culture. Experience books through my lens.',
      image: null,
      social: { instagram: 'https://www.instagram.com/theestheradesina', facebook: 'https://www.facebook.com/estheribukunoluwa.adesina.5', linkedin: 'https://www.linkedin.com/in/esther-adesina-9a4641242/' } 
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative text-black overflow-hidden">
        {/* Background Pattern */}
        {/* <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        </div> */}
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-purple-700 bg-clip-text text-transparent">
              Welcome to EStarr Bookart Hub
            </h1>
            <p className="text-[14px] md:text-2xl italic text-gray-600 max-w-3xl mx-auto">
              More than a bookstore — a hub for growth, purpose, and impact through reading
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="pb-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl text-center font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 text-center">
                <p>
                  EStarr Bookart was born from a simple yet powerful vision: to create a vibrant community where books are not just sold, but celebrated as tools for transformation.
                </p>
                <p>
                  A vision that started through the eyes of an 8-year-old child with a deep curiosity for growth and personal development has evolved into a brand committed to helping people become better versions of themselves through intentional reading; making books accessible, affordable, and undeniably attractive to everyone.
                </p>
                <p>
                  Currently based within Obafemi Awolowo University (OAU), Ile-Ife, EStarr Bookart is steadily growing into a trusted destination for readers seeking knowledge, inspiration, and personal growth. Today, we proudly serve a growing community of royals, thinkers, and change-makers.
                </p>
                <p>
                  At EStarr Bookart, we are building a culture of readers, leaders, and lifelong learners who understand that investing in books is investing in oneself.
                </p>
                <p>
                  Welcome to EStarr Bookart; Your Home of Good Books.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="/estarr.jpeg" 
                  alt="EStarr Bookart Hub" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x400?text=EStarr+Bookart+Hub';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <p className="text-lg font-semibold">"Invest in books, invest in yourself"</p>
                    <p className="text-sm opacity-80">- EStarr Bookart Hub</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Building a community of readers, one book at a time
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white mb-4`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100"
            >
              <div className="inline-flex p-3 bg-blue-500/20 rounded-xl mb-4">
                <HiOutlineBookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                From a simple love for reading to a growing community of readers, we are committed to nurturing a culture where books are celebrated as a tool for transformation.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100"
            >
              <div className="inline-flex p-3 bg-purple-500/20 rounded-xl mb-4">
                <HiOutlineSparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                Reserving lives. To become the leading hub for book lovers across the world and trusted book brand for royals. People’s lives get better here and that’s our testimony.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-all"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${value.color} text-white mb-4`}>
                  <value.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-16 px-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose EStarr Bookart Hub?
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              We go beyond just selling books — we create exceptional experiences
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: HiTruck,
                title: 'Free Delivery',
                description: 'Special delivery discounts available on orders above ₦50,000 across Nigeria.',
                color: 'cyan'
              },
              {
                icon: HiShieldCheck,
                title: 'Authentic Books',
                description: '100% genuine books from trusted publishers and sources',
                color: 'green'
              },
              {
                icon: HiClock,
                title: 'Fast Shipping',
                description: 'Quick and reliable delivery to your doorstep',
                color: 'purple'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all"
              >
                <item.icon className={`w-12 h-12 text-${item.color}-400 mx-auto mb-4`} />
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-300">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Passionate individuals dedicated to spreading the joy of reading
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
            {team.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-32" />
                <div className="text-center px-6 pb-6">
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-cyan-500 mx-auto -mt-12 flex items-center justify-center shadow-lg">
                    <span className="text-4xl font-bold text-cyan-600">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mt-4">{member.name}</h3>
                  <p className="text-cyan-600 font-medium mb-2">{member.role}</p>
                  <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                  <div className="flex justify-center gap-3">
                    <a href={member.social.instagram} target='_blank' className="p-2 bg-gray-100 rounded-full hover:bg-cyan-100 transition-colors">
                      <FaInstagram className="w-5 h-5 text-gray-600 hover:text-cyan-600" />
                    </a>
                    <a href={member.social.facebook} target='_blank' className="p-2 bg-gray-100 rounded-full hover:bg-cyan-100 transition-colors">
                      <FaFacebook className="w-5 h-5 text-gray-600 hover:text-cyan-600" />
                    </a>
                    <a href={member.social.linkedin} target='_blank' className="p-2 bg-gray-100 rounded-full hover:bg-cyan-100 transition-colors">
                      <FaLinkedin className="w-5 h-5 text-gray-600 hover:text-cyan-600" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Connect Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Connect With Us
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Follow us on social media for updates, new arrivals, and exclusive offers
            </p>
            
            <div className="flex justify-center gap-6 mb-12">
              <a 
                href="https://www.instagram.com/theestheradesina" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 bg-white/20 rounded-full hover:bg-white/30 transition-all hover:scale-110"
              >
                <FaInstagram className="w-8 h-8" />
              </a>
              <a 
                href="https://www.facebook.com/estheribukunoluwa.adesina.5" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 bg-white/20 rounded-full hover:bg-white/30 transition-all hover:scale-110"
              >
                <FaFacebook className="w-8 h-8" />
              </a>
              <a 
                href="https://www.linkedin.com/in/esther-adesina-9a4641242/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-4 bg-white/20 rounded-full hover:bg-white/30 transition-all hover:scale-110"
              >
                <FaLinkedin className="w-8 h-8" />
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
              <p className="text-blue-100 mb-6">
                Subscribe to our newsletter for book recommendations and special offers
              </p>
              <form className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-3 rounded-full bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition-all"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;