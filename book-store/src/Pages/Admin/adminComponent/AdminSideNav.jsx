import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ADMIN_ROUTE = import.meta.env.VITE_ADMIN_ROUTE;

const AdminSideNav = () => {
  const location = useLocation();

  return (
    <nav className="w-56 min-h-screen bg-white shadow-lg p-6 flex flex-col">
      <h3 className="text-2xl font-bold mb-8 text-blue-700">Admin Panel</h3>
      <ul className="flex-1 space-y-4">
        <li>
          <Link
            to={`/${ADMIN_ROUTE}/dashboard`}
            className={`block px-4 py-2 rounded transition ${
              location.pathname.includes('dashboard')
                ? 'bg-blue-100 text-blue-700 font-semibold'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </Link>
        </li>
        {/* Add more links as needed */}
      </ul>
      <button
        onClick={() => {
          localStorage.removeItem('adminToken');
          window.location.href = `/${ADMIN_ROUTE}/login`;
        }}
        className="mt-8 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </nav>
  );
};

export default AdminSideNav;