/**
 * SEO Utilities - Meta tags, Structured Data, Sitemap
 */

export const setSeoMeta = (config = {}) => {
  const {
    title = 'BookStore - Your Online Book Store',
    description = 'Discover millions of books at amazing prices. Fast shipping, secure checkout, and great customer service.',
    keywords = 'books, online bookstore, buy books, fiction, non-fiction',
    image = 'https://via.placeholder.com/1200x630',
    url = window.location.href,
    type = 'website',
    author = 'BookStore Team'
  } = config;

  // Standard Meta Tags
  document.title = title;
  setMetaTag('name', 'description', description);
  setMetaTag('name', 'keywords', keywords);
  setMetaTag('name', 'author', author);
  setMetaTag('name', 'viewport', 'width=device-width, initial-scale=1');

  // Open Graph Tags (Social Media)
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:image', image);
  setMetaTag('property', 'og:url', url);
  setMetaTag('property', 'og:type', type);

  // Twitter Card Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', image);

  // Canonical URL
  setCanonicalUrl(url);
};

const setMetaTag = (type, name, content) => {
  let element = document.querySelector(`meta[${type}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(type, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const setCanonicalUrl = (url) => {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
};

// Structured Data (JSON-LD)
export const setStructuredData = (data) => {
  let script = document.querySelector('script[type="application/ld+json"]');
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
};

export const getProductSchema = (product) => ({
  '@context': 'https://schema.org/',
  '@type': 'Product',
  name: product.title,
  description: product.description,
  image: product.image,
  brand: { '@type': 'Brand', name: product.author },
  offers: {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: 'NGN',
    availability: 'https://schema.org/InStock',
    url: window.location.href
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: product.rating || 4.5,
    reviewCount: product.reviewCount || 0
  }
});

export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'BookStore',
  url: window.location.origin,
  logo: `${window.location.origin}/logo.png`,
  description: 'Your trusted online bookstore with millions of titles',
  sameAs: [
    'https://facebook.com/bookstore',
    'https://twitter.com/bookstore',
    'https://instagram.com/bookstore'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+234-1-234-5678',
    contactType: 'Customer Service',
    areaServed: 'NG',
    availableLanguage: ['en']
  }
});

export const getBreadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: item.name,
    item: item.url
  }))
});

// Sitemap Generator
export const generateSitemap = (pages) => {
  const baseUrl = window.location.origin;
  const urlset = pages.map(page => `
    <url>
      <loc>${baseUrl}${page.path}</loc>
      <lastmod>${new Date(page.lastModified || Date.now()).toISOString().split('T')[0]}</lastmod>
      <changefreq>${page.changefreq || 'weekly'}</changefreq>
      <priority>${page.priority || 0.8}</priority>
    </url>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urlset}
    </urlset>`;
};

// Robots.txt Content
export const generateRobotsTxt = () => {
  return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard/
Disallow: /*.json$
Crawl-delay: 1

Sitemap: ${window.location.origin}/sitemap.xml`;
};

// Mobile App Meta Tags
export const setAppMetaTags = () => {
  setMetaTag('name', 'apple-mobile-web-app-capable', 'yes');
  setMetaTag('name', 'apple-mobile-web-app-status-bar-style', 'black-translucent');
  setMetaTag('name', 'apple-mobile-web-app-title', 'BookStore');
  setMetaTag('name', 'msapplication-TileColor', '#2196F3');
};

// Performance & Loading
export const preloadResources = (urls) => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = url.endsWith('.js') ? 'script' : url.endsWith('.css') ? 'style' : 'font';
    link.href = url;
    document.head.appendChild(link);
  });
};

// Generate sitemaps and robots.txt
export const generateSEOFiles = async () => {
  const pages = [
    { path: '/', lastModified: new Date(), changefreq: 'daily', priority: 1.0 },
    { path: '/category', lastModified: new Date(), changefreq: 'daily', priority: 0.9 },
    { path: '/blog', lastModified: new Date(), changefreq: 'weekly', priority: 0.8 },
    { path: '/about', lastModified: new Date(), changefreq: 'monthly', priority: 0.7 },
    { path: '/contact', lastModified: new Date(), changefreq: 'monthly', priority: 0.7 },
  ];

  const sitemapContent = generateSitemap(pages);
  const robotsContent = generateRobotsTxt();

  return { sitemapContent, robotsContent };
};
