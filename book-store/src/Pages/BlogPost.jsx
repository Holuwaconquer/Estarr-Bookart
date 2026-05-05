import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { HiCalendar, HiUser, HiTag, HiArrowLeft, HiHeart, HiShare, HiBookOpen } from 'react-icons/hi';
import { getBlogPostBySlug, getRelatedPosts } from '../data/blogData';
import useCanonicalUrl from '../../useCanonicalUrl';

const BlogPost = () => {
  useCanonicalUrl()
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  
  useEffect(() => {
    document.title = `${post?.title || "Blog Post"} | EStarr Bookart Hub`;
    window.scrollTo(0, 0);
  }, [post])
  
  useEffect(() => {
    // Load blog post from static data
    const foundPost = getBlogPostBySlug(slug);
    
    if (foundPost) {
      setPost(foundPost);
      setLikesCount(foundPost.likes || 0);
      
      // Get related posts
      const related = getRelatedPosts(foundPost.id, foundPost.category, 3);
      setRelatedPosts(related);
      
      // Update document title and meta tags for SEO
      document.title = `${foundPost.title} | EStarr Bookart Hub Blog`;
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', foundPost.excerpt);
      } else {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        metaDescription.content = foundPost.excerpt;
        document.head.appendChild(metaDescription);
      }
      
      // Update OG tags
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', `${foundPost.title} | EStarr Bookart Hub`);
      } else {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        ogTitle.setAttribute('content', `${foundPost.title} | EStarr Bookart Hub`);
        document.head.appendChild(ogTitle);
      }
      
      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', foundPost.excerpt);
      } else {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        ogDescription.setAttribute('content', foundPost.excerpt);
        document.head.appendChild(ogDescription);
      }
      
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) {
        ogUrl.setAttribute('content', `${window.location.origin}/blog/${slug}`);
      } else {
        ogUrl = document.createElement('meta');
        ogUrl.setAttribute('property', 'og:url');
        ogUrl.setAttribute('content', `${window.location.origin}/blog/${slug}`);
        document.head.appendChild(ogUrl);
      }
      
      let ogImage = document.querySelector('meta[property="og:image"]');
      const imageUrl = foundPost.featuredImage ? `${window.location.origin}${foundPost.featuredImage}` : `${window.location.origin}/og-image.jpg`;
      if (ogImage) {
        ogImage.setAttribute('content', imageUrl);
      } else {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        ogImage.setAttribute('content', imageUrl);
        document.head.appendChild(ogImage);
      }
      
      // Track view (for analytics if you have it)
      if (typeof gtag !== 'undefined') {
        gtag('event', 'view_blog_post', {
          'blog_title': foundPost.title,
          'blog_category': foundPost.category
        });
      }
    } else {
      // Post not found
      navigate('/blog');
    }
  }, [slug, navigate]);
  
  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLikesCount(prev => prev + 1);
      // Save to localStorage to persist likes
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
      if (!likedPosts.includes(post.id)) {
        likedPosts.push(post.id);
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
      }
    }
  };
  
  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: post.excerpt,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };
  
  if (!post) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading article...</p>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      {/* Article Schema JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": post.title,
          "description": post.excerpt,
          "image": post.featuredImage ? `${window.location.origin}${post.featuredImage}` : `${window.location.origin}/og-image.jpg`,
          "datePublished": post.publishedAt,
          "dateModified": post.publishedAt,
          "author": {
            "@type": "Person",
            "name": post.author.name
          },
          "publisher": {
            "@type": "Organization",
            "name": "EStarr Bookart Hub",
            "logo": {
              "@type": "ImageObject",
              "url": `${window.location.origin}/estarr.jpeg`
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": window.location.href
          }
        })}
      </script>
      
      <article className="bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-16">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="max-w-4xl mx-auto px-4 relative z-10">
            <button
              onClick={() => navigate('/blog')}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <HiArrowLeft className="w-5 h-5" />
              Back to Blog
            </button>
            
            {post.category && (
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm mb-4">
                {post.category}
              </span>
            )}
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <HiUser className="w-5 h-5" />
                <span>{post.author.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <HiCalendar className="w-5 h-5" />
                <span>{format(new Date(post.publishedAt), 'MMMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <HiBookOpen className="w-5 h-5" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-10">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full rounded-2xl shadow-2xl"
              loading="eager"
            />
          </div>
        )}
        
        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div 
            className="prose prose-lg prose-cyan max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gray-200">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm flex items-center gap-1"
                >
                  <HiTag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Engagement Actions */}
          <div className="flex items-center gap-6 mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={handleLike}
              disabled={liked}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                liked ? 'bg-red-50 text-red-500 cursor-default' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <HiHeart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              <span>{likesCount} Likes</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
            >
              <HiShare className="w-5 h-5" />
              Share
            </button>
          </div>
          
          {/* Author Bio */}
          <div className="mt-12 p-6 bg-gray-100 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                {post.author.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-gray-800">About {post.author.name}</h4>
                <p className="text-gray-600 text-sm">
                  {post.author.name === "Esther Adeleke" 
                    ? "Founder of EStarr Bookart Hub. Passionate about fostering a reading culture and empowering minds through literature."
                    : "Creative Director at EStarr Bookart Hub. Driving creative vision and community engagement initiatives."
                  }
                </p>
              </div>
            </div>
          </div>
          
          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Related Articles</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map(related => (
                  <div
                    key={related.id}
                    onClick={() => navigate(`/blog/${related.slug}`)}
                    className="cursor-pointer group"
                  >
                    {related.featuredImage && (
                      <img
                        src={related.featuredImage}
                        alt={related.title}
                        className="w-full h-48 object-cover rounded-lg mb-3 group-hover:opacity-90 transition"
                      />
                    )}
                    <h4 className="font-semibold text-gray-800 group-hover:text-cyan-600 transition">
                      {related.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(new Date(related.publishedAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  );
};

export default BlogPost;