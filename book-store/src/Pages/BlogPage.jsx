import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { HiSearch, HiCalendar, HiUser, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { getAllBlogPosts, getAllCategories, searchPosts } from '../data/blogData';

const BlogPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [allPosts] = useState(getAllBlogPosts());
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  
  useEffect(() => {
    // Update meta tags for blog page
    document.title = 'Blog | EStarr Bookart Hub - Latest News and Articles';
    window.scrollTo(0, 0);
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Discover the latest book reviews, reading tips, and literary news at EStarr Bookart Hub Blog. Stay updated with our latest articles and recommendations.');
    }
    
    // Load categories
    setCategories(getAllCategories());
  }, []);
  
  useEffect(() => {
    // Filter posts based on category and search
    let filtered = [...allPosts];
    
    if (selectedCategory) {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = searchPosts(searchQuery);
    }
    
    // Paginate
    const startIndex = (currentPage - 1) * postsPerPage;
    const paginatedPosts = filtered.slice(startIndex, startIndex + postsPerPage);
    setPosts(paginatedPosts);
    
    // Update URL params
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    navigate(`/blog?${params.toString()}`, { replace: true });
    
  }, [selectedCategory, searchQuery, currentPage, allPosts, navigate]);
  
  const totalPages = Math.ceil(
    (searchQuery || selectedCategory 
      ? (selectedCategory 
          ? allPosts.filter(p => p.category === selectedCategory).length 
          : searchPosts(searchQuery).length)
      : allPosts.length) / postsPerPage
  );
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };
  
  const clearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setCurrentPage(1);
  };
  
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Blog</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Discover articles, book reviews, and literary insights from the EStarr Bookart team
            </p>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              />
            </form>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>
                  {cat.name} ({cat.count})
                </option>
              ))}
            </select>
            
            {(searchQuery || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          {/* Blog Grid */}
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No articles found</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => navigate(`/blog/${post.slug}`)}
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                  >
                    {post.featuredImage && (
                      <div className="h-56 overflow-hidden">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      {post.category && (
                        <span className="inline-block px-2 py-1 bg-cyan-100 text-cyan-600 text-xs rounded-full mb-3">
                          {post.category}
                        </span>
                      )}
                      <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-cyan-600 transition line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <HiUser className="w-3 h-3" />
                            <span>{post.author.name.split(' ')[0]}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <HiCalendar className="w-3 h-3" />
                            <span>{format(new Date(post.publishedAt), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                        <span className="text-cyan-600 group-hover:translate-x-1 transition">Read More →</span>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
                  >
                    <HiChevronLeft className="w-5 h-5" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 rounded-lg transition ${
                        currentPage === i + 1
                          ? 'bg-cyan-500 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition"
                  >
                    <HiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogPage;