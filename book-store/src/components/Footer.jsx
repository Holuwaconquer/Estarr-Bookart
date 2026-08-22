import React from 'react';
import { Link } from 'react-router-dom';
import { IoLocationOutline, IoCallOutline, IoMailOutline } from 'react-icons/io5';
import Estarr from '../assets/estarr.jpeg';

const columns = [
  { title: 'Store', links: [{ path: '/about', label: 'About us' }, { path: '/category', label: 'Collections' }, { path: '/blog', label: 'Blog' }] },
  { title: 'Legal', links: [{ path: '/legal/privacy-policy', label: 'Privacy policy' }, { path: '/legal/terms-of-service', label: 'Terms of service' }, { path: '/legal/returns-policy', label: 'Returns policy' }, { path: '/legal/shipping-info', label: 'Shipping info' }] },
  { title: 'Support', links: [{ path: '/support/faq', label: 'FAQ' }, { path: '/contact', label: 'Contact us' }] },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#14121F] text-white overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg,#6C3CE9,#FF3D81,#FFB800,#00C2A8,#3D8BFF)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr_1fr_1fr] gap-10 lg:gap-8 pb-12 border-b border-white/10">
          <div>
            <Link to="/" className="inline-flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-full p-[2px] flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#6C3CE9,#FF3D81,#FFB800)' }}>
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <img src={Estarr} className="w-full h-full object-contain" alt="EStarr Bookart" />
                </div>
              </div>
              <span className="font-serif text-xl font-semibold">EStarr Bookart</span>
            </Link>

            <p className="text-white/50 text-sm leading-relaxed max-w-xs mb-6">
              Your journey to greatness begins with a good book. Quality, affordable reads — your home of good books.
            </p>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <IoLocationOutline className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#FFB800' }} />
                <span className="text-white/50">OAU Ile-Ife, Osun State, Nigeria</span>
              </div>
              <div className="flex items-start gap-3">
                <IoCallOutline className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#FFB800' }} />
                <span className="text-white/50">+234 814 515 7410 &middot; +234 701 626 7055</span>
              </div>
              <div className="flex items-start gap-3">
                <IoMailOutline className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#FFB800' }} />
                <span className="text-white/50">estarrbookart@gmail.com</span>
              </div>
            </div>
          </div>

          {columns.map((col, i) => (
            <div key={col.title}>
              <h3 className="font-bold text-[11px] uppercase tracking-[0.15em] mb-4" style={{ color: ['#FF3D81', '#00C2A8', '#3D8BFF'][i] }}>
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-white/50 hover:text-white text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-white/30 text-xs">&copy; {currentYear} EStarr Bookart. All rights reserved.</p>
          <p className="text-white/30 text-xs font-mono">Made with color &middot; Ile-Ife, Nigeria</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;