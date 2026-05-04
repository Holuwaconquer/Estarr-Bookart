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
                { path: '/category', label: 'Collections' },
                { path: '/limited-editions', label: 'Limited Editions' },
                { path: '/signed-books', label: 'Signed Copies' },
                { path: '/concierge', label: 'Concierge Service' },
              ].map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors text-sm hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;