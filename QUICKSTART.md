# 🏃 StoreApp - Quick Start Guide

## Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v16+) - [Download](https://nodejs.org/)
- **npm** (v8+) or **yarn** - Comes with Node.js
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

---

## Installation

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd StoreApp
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create `.env` file in Backend folder:
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/storeapp
JWT_SECRET=your_jwt_secret_key_here
KORAPAY_PUBLIC_KEY=your_korapay_public_key
KORAPAY_SECRET_KEY=your_korapay_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
```

Start backend server:
```bash
npm start
```

Backend will run at: `http://localhost:3000`

### 3. Frontend Setup

Open new terminal:
```bash
cd book-store
npm install
```

Create `.env` file in book-store folder:
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_FACEBOOK_APP_ID=your_facebook_app_id
```

Start development server:
```bash
npm run dev
```

Frontend will run at: `http://localhost:5173`

---

## First Run

1. **Backend starts** → MongoDB connects
2. **Frontend starts** → Vite dev server loads
3. **Open browser** → http://localhost:5173
4. **Landing page loads** → Explore the app!

---

## Available Scripts

### Backend

```bash
npm start          # Start server
npm run dev        # Start with nodemon (auto-restart)
npm test           # Run tests
npm run build      # Build for production
```

### Frontend

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run linter
npm run format     # Format code
```

---

## Project Structure Quick Reference

```
Backend/
  ├── controller/          # Request handlers
  ├── model/              # Database schemas
  ├── routes/             # API routes
  ├── middleware/         # Auth, error handling
  ├── services/           # Business logic
  └── server.js           # Entry point

book-store/
  ├── src/
  │   ├── Pages/         # Page components
  │   ├── components/    # Reusable components
  │   ├── contexts/      # Context providers
  │   ├── services/      # API calls
  │   └── App.jsx        # Main component
  └── index.html         # HTML template
```

---

## Common Tasks

### Add a New Book
```javascript
// POST /api/books
{
  "title": "Book Title",
  "author": "Author Name",
  "price": 5000,
  "description": "Book description",
  "category": "Fiction",
  "isbn": "1234567890",
  "pages": 320,
  "edition": "1st Edition"
}
```

### Create User Account
1. Click "Sign Up" on landing page
2. Fill in email, password, full name
3. Verify email (check console for link in dev)
4. Login with credentials

### Test Payment
- Use **Korapay Test Card**: `4111 1111 1111 1111`
- **Expiry**: Any future date
- **CVV**: Any 3 digits

---

## Troubleshooting

### Backend Won't Start
```bash
# Check if port 3000 is in use
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process on port 3000
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Restart backend
npm start
```

### MongoDB Connection Error
```bash
# Verify MongoDB is running
mongo --version

# Start MongoDB service
mongod  # macOS/Linux
net start MongoDB  # Windows

# Check connection string in .env
# Should be: mongodb://localhost:27017/storeapp
```

### Frontend Can't Connect to Backend
```bash
# Verify backend is running on port 3000
curl http://localhost:3000/api/books

# Check VITE_API_BASE_URL in .env
# Should be: http://localhost:3000/api

# Restart frontend
npm run dev
```

### Port Already in Use
```bash
# Change port in .env
PORT=3001

# Change Vite port in vite.config.js
export default {
  server: {
    port: 5174
  }
}
```

---

## Testing Features

### User Flow
1. ✅ Sign up with new email
2. ✅ Login with credentials
3. ✅ Browse books in Shop
4. ✅ Search for specific book
5. ✅ Filter by category/price
6. ✅ View product details
7. ✅ Add to cart
8. ✅ View wishlist
9. ✅ Proceed to checkout
10. ✅ Test payment methods

### Admin Flow
1. ✅ Login to admin panel
2. ✅ View all orders
3. ✅ Update order status
4. ✅ Create blog post
5. ✅ Edit blog post
6. ✅ Feature a post
7. ✅ View analytics

### Payment Testing
- **Korapay**: Use test cards from Korapay dashboard
- **Bank Transfer**: Shows bank details in checkout
- **Cash on Delivery**: Completes immediately

---

## Database Seeding

Seed sample data:
```bash
cd Backend
node scripts/seedData.js
```

Or manually add through API:
```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Sample Book","author":"Author","price":2500}'
```

---

## Debugging

### Backend Debugging
```javascript
// Add console logs
console.log('Debug info:', variable);

// Check request body
console.log('Request:', req.body);

// View database operations
// Add { debug: true } to MongoDB connection
```

### Frontend Debugging
```javascript
// React DevTools
// Install: https://react-devtools-tutorial.vercel.app/

// Network tab
// Check API requests in DevTools → Network tab

// Console errors
// DevTools → Console tab shows errors/warnings
```

### API Testing with Postman
1. Download [Postman](https://www.postman.com/downloads/)
2. Create new request
3. Set URL: `http://localhost:3000/api/books`
4. Test endpoints directly

---

## Development Tips

### Hot Reload
- **Frontend**: Changes auto-reload in browser
- **Backend**: Use `npm run dev` for nodemon auto-restart

### Code Formatting
```bash
# Format code with Prettier
npm run format

# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix
```

### Performance Monitoring
- **Frontend**: DevTools → Performance tab
- **Backend**: Check response times in console

### Component Development
1. Create component in `src/components/`
2. Export from index file
3. Import in pages
4. Use in JSX

---

## Key Endpoints

### Public
- `GET /` - Home page
- `GET /shop` - Shop page
- `GET /book/:id` - Product detail
- `GET /api/books` - List books
- `GET /api/categories` - List categories

### Authenticated
- `GET /dashboard` - User dashboard
- `POST /api/orders` - Create order
- `GET /api/orders` - User orders
- `POST /api/cart/add` - Add to cart

### Admin
- `GET /admin` - Admin dashboard
- `GET /api/admin/orders` - All orders
- `PATCH /api/admin/orders/:id/status` - Update status
- `POST /api/admin/blog` - Create blog post

---

## Support & Resources

- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Framer Motion**: https://www.framer.com/motion/
- **MongoDB**: https://docs.mongodb.com
- **Express.js**: https://expressjs.com

---

## Next Steps

After running locally:
1. ✅ Test all features
2. ✅ Make any custom changes
3. ✅ Follow DEPLOYMENT_GUIDE.md to deploy
4. ✅ Share with users!

---

**Happy Coding! 🚀**

For detailed information, see:
- PROJECT_SUMMARY.md - Full project details
- TESTING_CHECKLIST.md - Testing guide
- DEPLOYMENT_GUIDE.md - Deployment steps
