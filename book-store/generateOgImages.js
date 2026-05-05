// scripts/generateOgImages.js
import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Register a font (optional - uses default if not available)
try {
  registerFont(path.join(__dirname, '../public/fonts/Poppins-Bold.ttf'), { family: 'Poppins' });
} catch (e) {
  console.log('Custom font not found, using default font');
}

// Blog posts data (import from your blogData.js)
const blogPosts = [
  {
    slug: "top-10-books-to-read-in-2026",
    title: "Top 10 Books to Read in 2026",
    category: "Book Recommendations"
  },
  {
    slug: "benefits-of-reading-daily",
    title: "10 Amazing Benefits of Reading Daily",
    category: "Reading Tips"
  },
  {
    slug: "nigerian-writers-you-should-read",
    title: "8 Nigerian Writers You Should Read Right Now",
    category: "Local Authors"
  },
  {
    slug: "how-to-start-a-book-club",
    title: "How to Start a Successful Book Club",
    category: "Book Clubs"
  },
  {
    slug: "benefits-of-reading-for-children",
    title: "Why Reading to Your Child Matters",
    category: "Parenting"
  }
];

// Function to wrap text
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

// Function to generate OG image for a blog post
async function generateOgImage(post, outputPath) {
  const width = 1200;
  const height = 630;
  
  // Create canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Draw gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1e3a8a');
  gradient.addColorStop(0.5, '#3b82f6');
  gradient.addColorStop(1, '#06b6d4');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Draw decorative elements
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 100 + 50, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw book icon (simple)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(width - 150, 50, 100, 150);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(width - 145, 55, 90, 140);
  
  // Add text
  ctx.fillStyle = 'white';
  
  // Category text
  ctx.font = 'bold 24px "Poppins", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText(post.category, 80, 120);
  
  // Title text (with wrapping)
  ctx.font = 'bold 52px "Poppins", Arial, sans-serif';
  ctx.fillStyle = 'white';
  const maxWidth = width - 200;
  const titleLines = wrapText(ctx, post.title, maxWidth);
  let y = 200;
  for (const line of titleLines) {
    ctx.fillText(line, 80, y);
    y += 70;
  }
  
  // Logo text
  ctx.font = '24px "Poppins", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText('EStarr Bookart Hub', 80, height - 80);
  
  // Website URL
  ctx.font = '18px "Poppins", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText('estarrbookart.com.ng', 80, height - 40);
  
  // Save to file
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Generated OG image: ${outputPath}`);
}

// Generate OG images for all blog posts
async function generateAllOgImages() {
  const outputDir = path.join(__dirname, '../public/blog/og');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  for (const post of blogPosts) {
    const outputPath = path.join(outputDir, `${post.slug}-og.jpg`);
    await generateOgImage(post, outputPath);
  }
  
  // Also generate a default OG image
  const defaultOutputPath = path.join(__dirname, '../public/og-image.jpg');
  await generateOgImage(
    { title: 'EStarr Bookart Hub', category: 'Premium Bookstore in Nigeria' },
    defaultOutputPath
  );
  
  console.log('🎉 All OG images generated successfully!');
}

generateAllOgImages().catch(console.error);