import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

const AboutLayout = () => {
  const aboutLinks = [
    { path: '/about', name: 'About Us' },
    { path: '/about/brand', name: 'Our Brand' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb />
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="md:w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b">About</h3>
              <nav className="space-y-2">
                {aboutLinks.map(link => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.path === '/about'}
                    className={({ isActive }) =>
                      `block px-3 py-2 rounded-lg text-sm transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutLayout;