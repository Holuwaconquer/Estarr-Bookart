import React from 'react';

const BookShowcase = () => {
  return (
    <section className="py-12">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-3xl font-extrabold text-[#28303F] mb-6">Book Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Placeholder book cards */}
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-2xl p-6 shadow-card">
              <div className="h-48 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg mb-4"></div>
              <h3 className="text-xl font-bold text-[#28303F] mb-2">Collection {item}</h3>
              <p className="text-gray-600 mb-4">Premium curated collection of rare books</p>
              <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                Explore Collection
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BookShowcase;