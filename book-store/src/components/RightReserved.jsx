import React from 'react';

const RightReserved = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-gray-900 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-gray-500 text-sm">
          <p>© {currentYear} EStarr Bookart. All premium editions are authenticated and guaranteed.</p>
          <p className="mt-1 text-xs">EStarr Bookart is a registered trademark. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default RightReserved;