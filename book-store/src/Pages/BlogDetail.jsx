import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogAPI } from '../services/api';
import { Calendar, User, ArrowLeft, Heart, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const BlogDetail = () => {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await blogAPI.getBlogById(id || slug);
        setBlog(response.data?.blog || response.data);
      } catch (error) {
        toast.error('Failed to load blog post');
        console.error('Blog fetch error:', error);
        setTimeout(() => navigate('/blog'), 2000);
      } finally {
        setLoading(false);
      }
    };

    if (id || slug) {
      fetchBlog();
    }
  }, [id, slug, navigate]);

  const handleLike = () => {
    setLiked(!liked);
    toast.success(liked ? 'Removed from favorites' : 'Added to favorites');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full"
        />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Blog Post Not Found</h1>
          <button
            onClick={() => navigate('/blog')}
            className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
          >
            ← Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Hero Image */}
      {blog.image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-96 md:h-[500px] overflow-hidden"
        >
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
        </motion.div>
      )}

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/blog')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-gray-900/80 hover:bg-gray-800 border border-gray-700 rounded-lg text-white transition-all backdrop-blur-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Blog
      </motion.button>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 md:px-12 pt-8 pb-6 border-b border-gray-700">
            {/* Category */}
            {blog.category && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-block px-4 py-1 bg-cyan-500/20 text-cyan-400 text-sm font-semibold rounded-full mb-4 border border-cyan-500/30"
              >
                {blog.category}
              </motion.span>
            )}

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              {blog.title}
            </motion.h1>

            {/* Meta Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 text-gray-400 text-sm pb-4"
            >
              {blog.author && (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{blog.author}</p>
                  </div>
                </div>
              )}
              {blog.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(blog.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              )}
              {blog.readTime && (
                <span>{blog.readTime} min read</span>
              )}
            </motion.div>
          </div>

          {/* Body */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="px-6 md:px-12 py-8"
          >
            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
              {typeof blog.content === 'string' ? (
                <div className="whitespace-pre-wrap break-words">
                  {blog.content}
                </div>
              ) : (
                <div>{blog.content}</div>
              )}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="px-6 md:px-12 py-6 border-t border-gray-700 bg-gray-900/30 flex items-center justify-between"
          >
            <div className="flex items-center gap-6 text-gray-400">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 transition-all ${
                  liked ? 'text-red-400' : 'hover:text-red-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                <span>{blog.likes || 0}</span>
              </button>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard');
              }}
              className="flex items-center gap-2 hover:text-cyan-400 transition-colors text-gray-400"
            >
              <Share2 className="w-5 h-5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </motion.div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="px-6 md:px-12 py-6 border-t border-gray-700 flex flex-wrap gap-2"
            >
              {blog.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30 hover:border-blue-500/50 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </motion.div>
          )}
        </motion.article>

        {/* Related Posts Section - Optional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 pt-12 border-t border-gray-700"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Continue Reading</h2>
          <button
            onClick={() => navigate('/blog')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all"
          >
            Browse All Articles
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogDetail;
