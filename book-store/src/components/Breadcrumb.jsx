import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiHome, HiChevronRight } from 'react-icons/hi';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  
  const pathNames = {
    'legal': 'Legal',
    'support': 'Support',
    'about': 'About',
    'privacy-policy': 'Privacy Policy',
    'terms-of-service': 'Terms of Service',
    'shipping-info': 'Shipping Info',
    'returns-policy': 'Returns Policy',
    'faq': 'FAQ',
    'brand': 'Our Brand',
    'contact': 'Contact Us'
  };

  // Don't show on homepage
  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 py-2 overflow-x-auto whitespace-nowrap">
      <Link to="/" className="hover:text-purple-600 transition flex items-center gap-1">
        <HiHome className="w-4 h-4" />
        <span>Home</span>
      </Link>
      
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = pathNames[name] || name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
        
        return (
          <div key={name} className="flex items-center gap-2">
            <HiChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
            {isLast ? (
              <span className="text-gray-800 font-medium">{displayName}</span>
            ) : (
              <Link to={routeTo} className="hover:text-purple-600 transition">
                {displayName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;