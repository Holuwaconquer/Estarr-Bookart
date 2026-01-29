# Quick Start Guide - BookStore App

## Prerequisites
- Node.js 18+ and npm 8+
- MongoDB running locally or remote connection string
- Git installed

## Backend Setup

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Environment Setup
Create a `.env` file in the Backend folder:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bookstore
JWT_SECRET=your_super_secret_key_here_change_this
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
VITE_API_URL=http://localhost:5000
```

### 3. Start Backend Server
```bash
npm start
# or for development with hot reload
npm run dev
```

Server will run on `http://localhost:5000`

## Frontend Setup

### 1. Install Dependencies
```bash
cd book-store
npm install
```

### 2. Environment Setup
Create a `.env` file in the book-store folder:
```env
VITE_API_URL=http://localhost:5000/api
VITE_ADMIN_ROUTE=admin
```

### 3. Start Development Server
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Testing the Application

### Test User Login
1. Navigate to `http://localhost:5173/login`
2. Enter credentials:
   - Email: `user@example.com`
   - Password: `password123`
3. Should redirect to user dashboard

### Test Admin Login
1. Navigate to `http://localhost:5173/admin/login`
2. Enter credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Should redirect to `/admin/dashboard`

### Test Admin Features
1. **Products Management**: `/admin/products`
   - Create new book
   - Edit book details
   - Delete book

2. **Orders Management**: `/admin/orders`
   - View all orders
   - Filter by status
   - Update order status

3. **Blog Management**: `/admin/blog`
   - Create blog post
   - Publish/unpublish
   - Add tags
   - Delete post

## Database Models

### User
```javascript
{
  _id: ObjectId,
  email: string,
  password: string (hashed),
  firstName: string,
  lastName: string,
  role: enum['user', 'admin'],
  phone: string,
  address: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Book
```javascript
{
  _id: ObjectId,
  title: string,
  author: string,
  description: string,
  price: number,
  discount: number,
  category: string,
  stock: number,
  isbn: string,
  publisher: string,
  publishDate: date,
  pages: number,
  image: string (URL),
  featured: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Order
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  items: [{
    bookId: ObjectId,
    title: string,
    price: number,
    quantity: number
  }],
  totalAmount: number,
  status: enum['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
  shippingAddress: string,
  paymentMethod: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Blog
```javascript
{
  _id: ObjectId,
  title: string,
  content: string,
  excerpt: string,
  category: string,
  tags: [string],
  featuredImage: string (URL),
  published: boolean,
  author: ObjectId (ref: User),
  views: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Common Tasks

### Add a New Book as Admin
1. Login as admin
2. Go to `/admin/products`
3. Click "Add Book" button
4. Fill in form:
   - Title: "Book Name"
   - Author: "Author Name"
   - Price: 29.99
   - Category: Select from dropdown
   - Stock: 50
   - Image: Paste URL
5. Click "Add Book"

### Update Order Status
1. Login as admin
2. Go to `/admin/orders`
3. Find order in list
4. Click "Update Status" in the order row
5. Select new status from dropdown
6. Save

### Create Blog Post
1. Login as admin
2. Go to `/admin/blog`
3. Click "Create Post" button
4. Fill in form:
   - Title: "Post Title"
   - Content: "Post content..."
   - Category: Select from dropdown
   - Tags: Type and press Enter to add
   - Featured Image: Paste URL
5. Click "Create Post"
6. Toggle "Published" to make it visible

## API Endpoints Reference

### Auth
```
POST /api/auth/login
POST /api/auth/register
GET /api/auth/me
```

### Books
```
GET /api/books
GET /api/books/featured
GET /api/books/bestsellers
GET /api/books/new-arrivals
GET /api/books/:id
POST /api/books (admin)
PUT /api/books/:id (admin)
DELETE /api/books/:id (admin)
```

### Orders
```
POST /api/orders
GET /api/orders/my-orders
GET /api/orders (admin)
GET /api/orders/:id
PUT /api/orders/:id/status (admin)
```

### Blog
```
GET /api/blog
GET /api/blog/admin/all (admin)
POST /api/blog (admin)
PUT /api/blog/:id (admin)
DELETE /api/blog/:id (admin)
```

## Troubleshooting

### "Cannot connect to backend"
- Make sure backend is running on correct port
- Check if API URL is correct in `.env`
- Check CORS settings in backend

### "Database connection failed"
- Verify MongoDB is running
- Check connection string in `.env`
- Ensure database name is correct

### "Admin can't access dashboard"
- Verify user has `role: 'admin'` in database
- Check JWT token is valid
- Clear browser cache and login again

### "Build error: Module not found"
- Run `npm install` again
- Delete `node_modules` and `.package-lock.json`
- Run `npm install` fresh

## Development Workflow

1. Make code changes
2. Save file (hot reload should work)
3. Test in browser
4. Check console for errors
5. Fix issues
6. Commit to git

## Build for Production

### Frontend
```bash
cd book-store
npm run build
# Output will be in dist/ folder
```

### Backend
```bash
cd Backend
npm run build
# If applicable
```

## Deployment

### Frontend (to Netlify/Vercel)
1. Connect Git repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables
5. Deploy

### Backend (to Render/Heroku)
1. Connect Git repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables
5. Deploy

---

## Further Help

- Check browser console for errors
- Check network tab for API issues
- Read component files for implementation details
- Refer to INTEGRATION_SUMMARY.md for complete project info
