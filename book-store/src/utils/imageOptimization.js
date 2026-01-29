/**
 * Image Optimization Utilities
 * Provides lazy loading, responsive images, and cloudinary optimization
 */

export const optimizeImageUrl = (url, options = {}) => {
  if (!url) return null;
  
  // If already a cloudinary URL, add transformations
  if (url.includes('cloudinary')) {
    const { width = 800, quality = 'auto', format = 'auto' } = options;
    const baseUrl = url.split('/upload/')[0];
    const imagePath = url.split('/upload/')[1];
    
    return `${baseUrl}/upload/w_${width},q_${quality},f_${format},c_fill/${imagePath}`;
  }
  
  return url;
};

export const getResponsiveImageSrcSet = (url) => {
  if (!url || !url.includes('cloudinary')) return null;
  
  const baseUrl = url.split('/upload/')[0];
  const imagePath = url.split('/upload/')[1];
  
  return {
    srcSet: `
      ${baseUrl}/upload/w_400,q_auto,f_auto,c_fill/${imagePath} 400w,
      ${baseUrl}/upload/w_800,q_auto,f_auto,c_fill/${imagePath} 800w,
      ${baseUrl}/upload/w_1200,q_auto,f_auto,c_fill/${imagePath} 1200w
    `,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    src: optimizeImageUrl(url, { width: 800 })
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

  return (
    <img
      ref={imgRef}
      alt={alt}
      className={`${className} ${!loaded ? 'blur-sm' : ''} transition-all duration-300`}
      onError={() => setError(true)}
      style={{ opacity: loaded ? 1 : 0.5 }}
    />
  );
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
