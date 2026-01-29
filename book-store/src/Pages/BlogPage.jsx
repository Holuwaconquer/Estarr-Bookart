import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogAPI } from '../services/api';
import { Calendar, User, ArrowLeft, Heart, MessageCircle, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const BlogPage = () => {
  const navigate = useNavigate();
  const [blogs, setBlog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await blogAPI.getAllBlogs({ limit: 20 });
        setBlog(response.data?.blogs || []);
      } catch (error) {
        toast.error('Failed to load blog posts');
        console.error('Blog fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter(blog =>
    blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const truncateContent = (content, wordCount = 50) => {
    const words = content?.split(' ') || [];
    return words.length > wordCount ? words.slice(0, wordCount).join(' ') + '...' : content;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <div className="relative h-96 bg-gradient-to-r from-cyan-500 to-blue-600 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-96 h-96 bg-white rounded-full -top-48 -left-48 mix-blend-multiply"></div>
          <div className="absolute w-96 h-96 bg-blue-300 rounded-full -bottom-40 right-20 mix-blend-multiply"></div>
        </div>
        <div className="relative h-full flex flex-col items-center justify-center px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-white mb-4"
          >
            Our Blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-50 max-w-2xl"
          >
            Discover stories, insights, and tips about books, reading, and literature
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <input
            type="text"
            placeholder="Search blog posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
        </motion.div>

        {/* Blog Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-800 rounded-lg h-96 animate-pulse"
              />
            ))}
          </div>
        ) : filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog, index) => (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                onClick={() => navigate(`/blog/${blog.slug || blog._id}`)}
                className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer border border-gray-700 hover:border-cyan-500/50"
              >
                {/* Image */}
                {blog.image && (
                  <div className="relative h-48 overflow-hidden bg-gray-700">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Category Badge */}
                  {blog.category && (
                    <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-semibold rounded-full mb-3 border border-cyan-500/30">
                      {blog.category}
                    </span>
                  )}

                  {/* Title */}
                  <h2 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                    {blog.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {truncateContent(blog.content)}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-700">
                    {blog.author && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{blog.author}</span>
                      </div>
                    )}
                    {blog.createdAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Engagement */}
                  <div className="flex items-center justify-between text-gray-400">
                    <div className="flex gap-4 text-sm">
                      <button className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                        <Heart className="w-4 h-4" />
                        <span>{blog.likes || 0}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span>{blog.commentsCount || 0}</span>
                      </button>
                    </div>
                    <button className="hover:text-cyan-400 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Read More Button */}
                <div className="px-6 py-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-t border-gray-700">
                  <button className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm transition-colors">
                    Read More →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 text-lg mb-4">
              {searchTerm ? 'No blog posts found matching your search' : 'No blog posts available yet'}
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                Clear search
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
