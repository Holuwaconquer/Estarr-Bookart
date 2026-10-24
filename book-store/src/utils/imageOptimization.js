import React from 'react';

/**
 * Image Optimization Utilities
 * Provides lazy loading, responsive images, and cloudinary optimization
 */

export const optimizeImageUrl = (url, options = {}) => {
  if (!url) return null;

  const uploadMarker = '/upload/';
  const uploadIndex = url.indexOf(uploadMarker);
  if (!url.includes('cloudinary') || uploadIndex === -1) return url;

  const { width = 640, quality = 'auto:good', format = 'auto' } = options;
  const baseUrl = url.slice(0, uploadIndex + uploadMarker.length);
  const imagePath = url.slice(uploadIndex + uploadMarker.length);
  return `${baseUrl}f_${format},q_${quality},c_limit,w_${width}/${imagePath}`;
};

export const getResponsiveImageSrcSet = (url, options = {}) => {
  if (!url || !url.includes('cloudinary') || !url.includes('/upload/')) return null;

  const { sizes = '(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 23vw' } = options;
  return {
    srcSet: [320, 480, 640, 960]
      .map((width) => `${optimizeImageUrl(url, { width })} ${width}w`)
      .join(', '),
    sizes,
    src: optimizeImageUrl(url, { width: 640 }),
  };
};

export const LazyImage = ({ src, alt, className, fallback = null, onLoad = null }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);
  const imgRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && imgRef.current) {
          imgRef.current.src = src;
          imgRef.current.addEventListener('load', () => {
            setLoaded(true);
            onLoad?.();
          });
          observer.unobserve(imgRef.current);
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src, onLoad]);

  if (error) return fallback;

  return React.createElement('img', {
    ref: imgRef,
    alt,
    className: `${className} ${!loaded ? 'blur-sm' : ''} transition-all duration-300`,
    onError: () => setError(true),
    style: { opacity: loaded ? 1 : 0.5 },
  });
};

// Image caching utility
export const cacheImage = (url) => {
  if (typeof window !== 'undefined' && 'caches' in window) {
    caches.open('images-v1').then(cache => {
      cache.add(url).catch(err => console.warn('Cache miss:', err));
    });
  }
};

// Prefetch critical images
export const prefetchImages = (urls) => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};
