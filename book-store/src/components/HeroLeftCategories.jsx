import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiChevronRight } from 'react-icons/hi';
import { categoryAPI } from '../services/api';

const HeroLeftCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryAPI.getAllCategories();
        console.log('Categories response:', response);
        // API returns data directly as an array
        const fetchedCategories = Array.isArray(response.data) ? response.data : [];
        console.log('Fetched categories:', fetchedCategories);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryName) => {
    navigate(`/category?cat=${categoryName.toLowerCase()}`);
  };

  if (loading) {
    return (
      <div className="h-96 bg-white rounded-2xl shadow-lg animate-pulse" />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="h-[450px] bg-white rounded-[4px] shadow-lg overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
        <h3 className="text-white font-bold text-lg">Categories</h3>
      </div>

      {/* Categories List */}
      <div className="flex-1 overflow-y-auto">
        {categories.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {categories.map((category, idx) => (
              <motion.div
                key={category._id || idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ backgroundColor: '#f9fafb' }}
                onClick={() => handleCategoryClick(category.name)}
                className="px-6 py-4 cursor-pointer transition-colors group flex items-center justify-between hover:bg-gray-50"
              >
                <span className="text-gray-700 font-medium group-hover:text-orange-600 transition-colors">
                  {category.name}
                </span>
                <HiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transform group-hover:translate-x-1 transition-all" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-center px-4">No categories available</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HeroLeftCategories;
