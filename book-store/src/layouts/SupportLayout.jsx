import React from 'react';
import { Outlet } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

const SupportLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb />
        <Outlet />
      </div>
    </div>
  );
};

export default SupportLayout;