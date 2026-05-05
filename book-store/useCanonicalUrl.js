import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useCanonicalUrl = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Get current path
    const currentPath = location.pathname;
    
    // Base URL
    const baseUrl = 'https://estarrbookart.com.ng';
    
    // Construct full canonical URL
    const canonicalUrl = `${baseUrl}${currentPath}`;
    
    // Remove trailing slash if present (except for root)
    const finalCanonicalUrl = currentPath === '/' 
      ? canonicalUrl 
      : canonicalUrl.replace(/\/$/, '');
    
    // Check if canonical tag already exists
    let link = document.querySelector("link[rel='canonical']");
    
    if (!link) {
      // Create new canonical tag
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    
    // Set the href attribute
    link.setAttribute('href', finalCanonicalUrl);
    
    console.log(`🔗 Canonical URL set to: ${finalCanonicalUrl}`);
    
    // Cleanup function (optional)
    return () => {
      // Don't remove on unmount as next page will replace it
    };
  }, [location]);
};

export default useCanonicalUrl;