# BookStore Application - Complete Setup & Usage Guide

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Installation & Setup](#installation--setup)
3. [Admin Panel Features](#admin-panel-features)
4. [Cloudinary Integration](#cloudinary-integration)
5. [Frontend Features](#frontend-features)
6. [API Documentation](#api-documentation)
7. [Troubleshooting](#troubleshooting)

---

## Project Overview

The BookStore application is a full-stack ecommerce platform with:
- **Admin Dashboard** for managing books, categories, orders, and blog posts
- **User Dashboard** for profile, orders, wishlist, and settings
- **Blog System** for content management and reading
- **Shopping Cart** with checkout functionality
- **Cloudinary Integration** for image management

### Tech Stack

**Frontend:**
- React 19 with React Router 7
- Tailwind CSS 4 for styling
- Framer Motion for animations
- Vite as build tool

**Backend:**
- Node.js/Express (external service)
- MongoDB for database
- Cloudinary for image hosting

---

## Installation & Setup

### 1. Install Dependencies

```bash
cd book-store
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the `book-store` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# Admin Route
VITE_ADMIN_ROUTE=admin

# Authentication (OAuth)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_FACEBOOK_APP_ID=your_facebook_app_id

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Production (optional)
VITE_PRODUCTION_API_URL=https://your-api-domain.com
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
npm run preview
```

---

## Admin Panel Features

### Access the Admin Dashboard

1. Navigate to `http://localhost:5173/admin/login`
2. Log in with admin credentials
3. You'll be redirected to the admin dashboard

### Dashboard Pages

#### **Dashboard Overview**
- View total users, orders, revenue, and average order value
- See recent orders
- View top-selling books
- Time range filtering (7 days, 30 days, quarterly, yearly)

#### **Products Management**
- **View All Books**: Paginated list with search functionality
- **Add New Book**: Create books with:
  - Title, Author, Description
  - Price, Discount, Stock Level
  - Category selection
  - ISBN, Publisher, Publication Date
  - Page count, Language
  - **Multiple Images**: Upload via Cloudinary (see Cloudinary section)
- **Edit Books**: Modify existing book details and images
- **Delete Books**: Remove books from inventory
- **Search**: Filter books by title or author

#### **Orders Management**
- View all customer orders
- Track order status (Pending, Processing, Shipped, Delivered)
- Update order status
- View customer details and items

#### **Blog Management**
- Create blog posts with title, content, author, category
- Upload featured images via Cloudinary
- Add tags and set publish status
- Edit and delete posts
- View post statistics (views, likes, comments)

#### **Users Management**
- View all registered users
- See user details and purchase history
- Manage user roles and permissions

#### **Analytics**
- Sales trends and revenue reports
- Top-selling books and categories
- Customer insights
- Export data

#### **Settings**
- Store configuration
- Payment settings
- Email notifications
- Security settings

---

## Cloudinary Integration

### Why Cloudinary?

Cloudinary provides:
- ✅ Fast image uploads from browser
- ✅ Automatic image optimization
- ✅ CDN delivery for fast loading
- ✅ Multiple image support per product
- ✅ No backend image processing needed

### Setup Instructions

See [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) for detailed setup guide.

**Quick Setup:**

1. Create free account at https://cloudinary.com/
2. Get Cloud Name from Dashboard
3. Create an Upload Preset (Settings → Upload tab)
4. Add to `.env.local`:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
   ```
5. Restart development server

### How to Upload Images

**In Admin Panel → Products:**

1. Click "Add New Book" or edit existing book
2. Scroll to "Book Images (via Cloudinary)"
3. Drag & drop or click to select images
4. Upload multiple images (first becomes main image)
5. Click submit

**Features:**
- Multiple image support
- Drag & drop interface
- Real-time upload progress
- Automatic image optimization
- File size validation (max 5MB)
- Supported formats: PNG, JPG, GIF, WebP

---

## Frontend Features

### Landing Page
- Featured products carousel
- Flash deals section
- Category browsing
- Search functionality
- Newsletter signup
- Product recommendations

### Product Pages
- Product detail with multiple images
- Price and discount display
- Product reviews and ratings
- Add to cart/wishlist
- Related products
- Customer reviews section

### Shopping Cart
- View all cart items
- Quantity adjustment
- Remove items
- Apply discount codes
- Proceed to checkout
- Cart total calculation

### User Dashboard
- **Overview**: Purchase statistics and recent orders
- **Profile**: User information and avatar
- **Orders**: Track orders, view details, download invoices
- **Wishlist**: Save favorite books
- **Settings**: Change password, notification preferences

### Blog
- Browse all blog posts
- Search functionality
- Filter by category
- Blog post details with comments
- Like and share posts
- Related posts recommendations

### Authentication
- User registration with email verification
- Login with email/password or OAuth (Google, Facebook)
- Password reset functionality
- Remember me option

---

## API Documentation

### Endpoints Used

#### **Books**
```javascript
// GET all books
GET /books?page=1&limit=10&search=query

// GET single book
GET /books/:id

// CREATE book (admin)
POST /books/admin/create
// Body: { title, author, price, images[], category, ... }

// UPDATE book (admin)
PUT /books/admin/:id
// Body: { title, author, price, images[], ... }

// DELETE book (admin)
DELETE /books/admin/:id

// SEARCH books
GET /books/search?q=query
```

#### **Categories**
```javascript
// GET all categories
GET /categories

// CREATE category (admin)
POST /categories/admin/create

// UPDATE category (admin)
PUT /categories/admin/:id

// DELETE category (admin)
DELETE /categories/admin/:id
```

#### **Blog**
```javascript
// GET all posts
GET /blog?page=1&limit=10

// GET single post
GET /blog/:id
GET /blog/slug/:slug

// CREATE post (admin)
POST /blog/admin/create

// UPDATE post (admin)
PUT /blog/admin/:id

// DELETE post (admin)
DELETE /blog/admin/:id
```

#### **Orders**
```javascript
// CREATE order
POST /orders
// Body: { items[], shippingAddress, ... }

// GET user orders
GET /orders

// GET single order
GET /orders/:id

// UPDATE order (admin)
PUT /orders/:id

// GET all orders (admin)
GET /orders/admin/all
```

#### **Users**
```javascript
// Register
POST /auth/register
// Body: { name, email, password, phone }

// Login
POST /auth/login
// Body: { email, password }

// Google OAuth
POST /auth/google
// Body: { token }

// Facebook OAuth
POST /auth/facebook
// Body: { token }

// Get profile
GET /auth/profile

// Update profile
PUT /auth/profile

// Password reset
POST /auth/forgot-password
POST /auth/reset-password
```

---

## Troubleshooting

### Common Issues

#### **Sidebar Not Showing in Admin Dashboard**
- **Solution**: This has been fixed in the latest update
- Check that you're viewing on desktop (MD breakpoint and above)
- Clear browser cache and restart development server

#### **Images Not Uploading**
- Check Cloudinary setup in `.env.local`
- Verify Upload Preset is set to "Unsigned"
- Check browser console for CORS errors
- Ensure environment variables are set correctly

#### **"createBook is now a function" Error**
- **Solution**: This has been fixed by adding proper API methods
- The issue was caused by missing `bookAPI.createBook` method
- It's now properly implemented in `src/services/api.js`

#### **Hardcoded Categories Showing**
- **Solution**: Now dynamically loaded from API
- Categories are fetched from backend in admin and frontend
- Admin can create new categories in admin panel

#### **Build Failing**
```bash
# Clear cache and rebuild
rm -rf node_modules .vite
npm install
npm run build
```

#### **Products Not Loading**
- Check API URL in `.env.local`
- Verify backend server is running
- Check browser Network tab for API errors
- Verify user is authenticated

#### **Blog Page Not Accessible**
- Route has been added to `App.jsx`
- Navigate to `/blog` or click Blog link in navbar
- Ensure backend blog API is available

### Getting More Help

1. Check browser console (F12) for errors
2. Check Network tab to see API responses
3. Review backend logs for server errors
4. Check `.env.local` for configuration issues
5. Ensure all dependencies are installed: `npm install`

---

## Development Tips

### Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint

# Clean install
npm run clean            # Clean dependencies and cache
npm install              # Fresh install

# Database
npm run seed            # Seed test data (if available)
```

### Debugging

1. **React DevTools**: Install React DevTools browser extension
2. **Network Debugging**: Use browser DevTools Network tab
3. **Component State**: Use React DevTools to inspect component state
4. **API Calls**: Log API responses in browser console

### Performance

- Images are optimized via Cloudinary
- Code splitting recommended for production
- Consider lazy loading for pages
- Use production build for testing: `npm run build && npm run preview`

---

## File Structure

```
book-store/
├── src/
│   ├── components/          # Reusable React components
│   ├── Pages/              # Page components
│   ├── layouts/            # Layout components
│   ├── services/           # API services
│   ├── utils/              # Utility functions (including cloudinary.js)
│   ├── contexts/           # Context providers
│   ├── assets/             # Images and static files
│   ├── App.jsx             # Main app router
│   ├── main.jsx            # React entry point
│   └── index.css            # Global styles
├── public/                 # Static files
├── .env.example           # Environment variables template
├── vite.config.js         # Vite configuration
├── package.json           # Dependencies
└── README.md              # This file
```

---

## Next Steps

1. ✅ Set up Cloudinary (see CLOUDINARY_SETUP.md)
2. ✅ Configure environment variables
3. ✅ Start development server
4. ✅ Test admin functionality
5. ✅ Test image uploads
6. ✅ Test blog pages
7. ✅ Test shopping flow
8. ✅ Deploy to production

---

## Support & Resources

- React: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- Vite: https://vitejs.dev
- Cloudinary: https://cloudinary.com/documentation
- React Router: https://reactrouter.com

---

**Last Updated**: 2024
**Version**: 1.0.0
