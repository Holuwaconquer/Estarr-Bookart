// scripts/generateSitemap.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.VITE_API_URL || 'https://estarrbookart.onrender.com';
const FRONTEND_URL = process.env.VITE_FRONTEND_URL || 'https://estarrbookart.onrender.com';

// Static routes in your React app
const staticRoutes = [
  { url: '/', priority: 1.0, changefreq: 'daily' },
  { url: '/category', priority: 0.9, changefreq: 'daily' },
  { url: '/about', priority: 0.8, changefreq: 'monthly' },
  { url: '/contact', priority: 0.8, changefreq: 'monthly' },
  { url: '/blog', priority: 0.9, changefreq: 'daily' },
  { url: '/faq', priority: 0.7, changefreq: 'monthly' },
  { url: '/privacy-policy', priority: 0.5, changefreq: 'yearly' },
  { url: '/terms-of-service', priority: 0.5, changefreq: 'yearly' },
  { url: '/shipping-info', priority: 0.6, changefreq: 'monthly' },
  { url: '/returns-policy', priority: 0.6, changefreq: 'monthly' },
];

// Function to fetch dynamic routes
async function fetchDynamicRoutes() {
  const routes = [];
  
  try {
    // Fetch all books
    const booksResponse = await axios.get(`${BASE_URL}/api/books?limit=1000`);
    const books = booksResponse.data?.books || booksResponse.data || [];
    
    books.forEach(book => {
      routes.push({
        url: `/product/${book._id}`,
        priority: 0.8,
        changefreq: 'weekly',
        lastmod: book.updatedAt || new Date().toISOString()
      });
    });
    console.log(`✅ Fetched ${books.length} books`);
    
    // Fetch all blog posts
    try {
      const blogsResponse = await axios.get(`${BASE_URL}/api/blog?limit=100`);
      const blogs = blogsResponse.data?.blogs || blogsResponse.data || [];
      
      blogs.forEach(blog => {
        routes.push({
          url: `/blog/${blog.slug || blog._id}`,
          priority: 0.8,
          changefreq: 'weekly',
          lastmod: blog.updatedAt || blog.createdAt || new Date().toISOString()
        });
      });
      console.log(`✅ Fetched ${blogs.length} blog posts`);
    } catch (error) {
      console.log('⚠️ Could not fetch blogs:', error.message);
    }
    
    // Fetch categories
    try {
      const categoriesResponse = await axios.get(`${BASE_URL}/api/categories`);
      const categories = categoriesResponse.data || [];
      
      categories.forEach(category => {
        routes.push({
          url: `/category?category=${encodeURIComponent(category.name)}`,
          priority: 0.7,
          changefreq: 'weekly'
        });
      });
      console.log(`✅ Fetched ${categories.length} categories`);
    } catch (error) {
      console.log('⚠️ Could not fetch categories:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error fetching dynamic routes:', error.message);
  }
  
  return routes;
}

// Generate sitemap XML
function generateSitemap(routes) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"\n';
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
  
  for (const route of routes) {
    xml += '  <url>\n';
    xml += `    <loc>${FRONTEND_URL}${route.url}</loc>\n`;
    if (route.lastmod) {
      xml += `    <lastmod>${new Date(route.lastmod).toISOString()}</lastmod>\n`;
    }
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += '  </url>\n';
  }
  
  xml += '</urlset>';
  return xml;
}

// Generate robots.txt
function generateRobotsTxt() {
  return `# SEO Configuration for EStarr Bookart Hub
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /checkout
Disallow: /cart

# Sitemap locations
Sitemap: ${FRONTEND_URL}/sitemap.xml
Sitemap: ${FRONTEND_URL}/blog-sitemap.xml

# Crawl delay for heavy crawlers
Crawl-delay: 1

# Host
Host: ${FRONTEND_URL}

# Allow Googlebot to crawl everything
User-agent: Googlebot
Allow: /
Crawl-delay: 0.5

# Allow Bingbot
User-agent: Bingbot
Allow: /
Crawl-delay: 0.5

# Block AI bots (optional)
User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /
`;
}

// Generate blog-specific sitemap
function generateBlogSitemap(blogs) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n';
  
  for (const blog of blogs) {
    xml += '  <url>\n';
    xml += `    <loc>${FRONTEND_URL}/blog/${blog.slug || blog._id}</loc>\n`;
    xml += `    <lastmod>${new Date(blog.updatedAt || blog.createdAt).toISOString()}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    
    // News sitemap for blog posts
    if (new Date(blog.createdAt) > new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)) {
      xml += '    <news:news>\n';
      xml += '      <news:publication>\n';
      xml += '        <news:name>EStarr Bookart Hub Blog</news:name>\n';
      xml += '        <news:language>en</news:language>\n';
      xml += '      </news:publication>\n';
      xml += `      <news:publication_date>${new Date(blog.createdAt).toISOString()}</news:publication_date>\n`;
      xml += `      <news:title>${escapeXml(blog.title)}</news:title>\n`;
      xml += '    </news:news>\n';
    }
    
    xml += '  </url>\n';
  }
  
  xml += '</urlset>';
  return xml;
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, function(c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Main function
async function main() {
  console.log('🚀 Generating sitemaps...\n');
  
  // Fetch dynamic routes
  const dynamicRoutes = await fetchDynamicRoutes();
  const allRoutes = [...staticRoutes, ...dynamicRoutes];
  
  // Generate main sitemap
  const sitemap = generateSitemap(allRoutes);
  const publicDir = path.join(__dirname, '..', 'public');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  console.log('✅ Generated sitemap.xml');
  
  // Generate robots.txt
  const robotsTxt = generateRobotsTxt();
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
  console.log('✅ Generated robots.txt');
  
  console.log('\n🎉 Sitemap generation complete!');
  console.log(`📊 Total URLs: ${allRoutes.length}`);
  console.log(`  - Static: ${staticRoutes.length}`);
  console.log(`  - Dynamic: ${dynamicRoutes.length}`);
}

main().catch(console.error);