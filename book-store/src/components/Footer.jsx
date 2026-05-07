import React from 'react';
import { Link } from 'react-router-dom';
import { 
  IoBook,
  IoLocationOutline,
  IoCallOutline,
  IoMailOutline,
  IoLogoFacebook,
  IoLogoTwitter,
  IoLogoInstagram,
  IoLogoYoutube
} from 'react-icons/io5';
import Estarr from '../assets/estarr.jpeg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Contact */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-15 h-15 rounded-xl p-1 bg-white flex items-center justify-center">
                <img src={Estarr} className='w-full h-full object-contain' alt="logo" />
              </div>
              <span className="text-xl font-bold">EStarr Bookart</span>
            </Link>
            
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              Your journey to greatness begins with a good book. Shop quality, affordable reads at EStarr Bookart: Your Home of Good Books.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <IoLocationOutline className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Address</p>
                  <p className="text-gray-400 text-sm">OAU Ile-Ife, Osun State, Nigeria</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <IoCallOutline className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Phone</p>
                  <p className="text-gray-400 text-sm">+234 814 515 7410</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <IoMailOutline className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Email</p>
                  <p className="text-gray-400 text-sm">estheribukunoluwa100@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 pb-2 border-b border-gray-700">Company</h3>
            <ul className="space-y-3">
              {[
                { path: '/about', label: 'About Us' },
                { path: '/category', label: 'Collections' }
              ].map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-gray-300 hover:text-white transition-colors text-sm hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 pb-2 border-b border-gray-700">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/legal/privacy-policy" className="hover:text-cyan-400 transition">Privacy Policy</Link></li>
              <li><Link to="/legal/terms-of-service" className="hover:text-cyan-400 transition">Terms of Service</Link></li>
              <li><Link to="/legal/returns-policy" className="hover:text-cyan-400 transition">Returns Policy</Link></li>
              <li><Link to="/legal/shipping-info" className="hover:text-cyan-400 transition">Shipping Info</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 pb-2 border-b border-gray-700">Support</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/support/faq" className="hover:text-cyan-400 transition">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-cyan-400 transition">Contact Us</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;