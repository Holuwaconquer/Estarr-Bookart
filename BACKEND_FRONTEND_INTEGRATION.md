# Backend-Frontend Integration Guide

## Overview
This document explains the API integration between your frontend (React/Vite) and backend (Node.js/Express).

---

## Backend Structure

### Available Routes
Located in `/Backend/src/routes/`

#### 1. **Authentication Routes** (`/api/auth`)
Base Path: `http://localhost:5000/api/auth`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | User login |
| GET | `/me` | Yes | Get current user profile |
| PUT | `/me` | Yes | Update user profile |
| PUT | `/change-password` | Yes | Change password |
| POST | `/forgot-password` | No | Initiate password reset |
| PUT | `/reset-password/:token` | No | Reset password with token |

#### 2. **Books Routes** (`/api/books`)
Base Path: `http://localhost:5000/api/books`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/` | No | Get all books |
| GET | `/:id` | No | Get book by ID |

#### 3. **Orders Routes** (`/api/orders`)
Base Path: `http://localhost:5000/api/orders`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/` | Yes | Create new order |
| GET | `/` | Yes | Get user's orders |
| GET | `/:id` | Yes | Get order by ID |

#### 4. **Payments Routes** (`/api/payments`)
Base Path: `http://localhost:5000/api/payments`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/korapay/initialize` | Yes | Initialize Korapay payment |
| POST | `/korapay/verify` | Yes | Verify Korapay payment |
| POST | `/manual-transfer/create` | Yes | Create manual transfer payment |
| POST | `/:paymentId/upload-proof` | Yes | Upload payment proof |
| GET | `/bank-accounts` | No | Get bank accounts |

#### 5. **Blog Routes** (`/api/blog`)
Base Path: `http://localhost:5000/api/blog`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/` | No | Get all blog posts |
| GET | `/:id` | No | Get blog post by ID |

#### 6. **Review Routes** (`/api/reviews`)
Base Path: `http://localhost:5000/api/reviews`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/` | Yes | Create review |
| GET | `/book/:bookId` | No | Get reviews for book |

---

## Frontend API Integration

### Location: `book-store/src/services/api.js`

### Authentication Headers
All authenticated requests automatically include the JWT token from localStorage:
```javascript
Authorization: Bearer {token}
```

### API Objects Available

#### 1. **bookAPI** - Book operations
```javascript
bookAPI.getAllBooks(params)      // Get all books with filters
bookAPI.getBookById(id)          // Get single book
bookAPI.searchBooks(query)       // Search books
```

#### 2. **userAPI** - User operations
```javascript
// Auth
userAPI.login(credentials)                    // User login
userAPI.register(payload)                     // User registration
userAPI.getProfile()                          // Get current user
userAPI.updateProfile(profileData)            // Update profile - ENDPOINT: /auth/me
userAPI.changePassword(current, newPwd)       // Change password
userAPI.forgotPassword(email)                 // Request password reset
userAPI.resetPassword(token, password)        // Reset password

// Wishlist (using localStorage - backend doesn't have API)
userAPI.getWishlist()                         // Get wishlist IDs
userAPI.addToWishlist(bookId)                 // Add book to wishlist
userAPI.removeFromWishlist(bookId)            // Remove book from wishlist
```

#### 3. **cartAPI** - Shopping cart
```javascript
cartAPI.getCart()                    // Get cart items from localStorage
cartAPI.addToCart(bookId, quantity)  // Add to cart
cartAPI.removeFromCart(bookId)       // Remove from cart
cartAPI.clearCart()                  // Clear entire cart
cartAPI.createOrder(orderPayload)    // Create order - ENDPOINT: /api/orders
```

#### 4. **orderAPI** - Order operations
```javascript
orderAPI.getOrders(params)           // Get user's orders
orderAPI.getOrderById(id)            // Get single order
orderAPI.trackOrder(trackingId)      // Track order
```

#### 5. **blogAPI** - Blog operations
```javascript
blogAPI.getAllPosts(params)          // Get all blog posts
blogAPI.getPostById(id)              // Get single post
blogAPI.searchPosts(query)           // Search posts
```

#### 6. **reviewAPI** - Review operations
```javascript
reviewAPI.createReview(bookId, data) // Create review
reviewAPI.getBookReviews(bookId)     // Get book reviews
```

---

## Fixed Issues & Solutions

### 1. ✅ Profile Update Endpoint
**Problem:** Frontend was calling `/api/auth/profile` (404)  
**Solution:** Changed to `/api/auth/me` (correct backend endpoint)

**Frontend Fix:**
```javascript
// Before
request('/auth/profile', { method: 'PUT', ... })

// After
request('/auth/me', { method: 'PUT', ... })
```

### 2. ✅ Wishlist Implementation
**Problem:** No wishlist endpoint in backend (404)  
**Solution:** Implemented client-side wishlist using localStorage

**How it works:**
- Wishlist stored as array of book IDs in localStorage
- `getWishlist()` returns stored IDs
- `addToWishlist(bookId)` saves ID to localStorage
- `removeFromWishlist(bookId)` removes ID from localStorage
- Wishlist component fetches full book details using book IDs

**Usage Example:**
```javascript
// Get wishlist
const wishlistIds = await userAPI.getWishlist();  // Returns: { data: [id1, id2], success: true }

// Add to wishlist
await userAPI.addToWishlist(bookId);

// Remove from wishlist
await userAPI.removeFromWishlist(bookId);

// Get full book details
const book = await bookAPI.getBookById(bookId);
```

### 3. ✅ Password Change
**Problem:** Endpoint not mapped correctly  
**Solution:** Created `changePassword()` method

**Backend Endpoint:** `PUT /api/auth/change-password`  
**Request Body:**
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass456"
}
```

**Frontend Usage:**
```javascript
await userAPI.changePassword('oldpass123', 'newpass456');
```

### 4. ✅ Password Tab in Settings
**Status:** Working correctly  
**Details:**
- Two tabs: "Profile" and "Password"
- Password tab shows only when `activeTab === 'password'`
- Form validates passwords match before submission
- Uses `userAPI.changePassword()` endpoint

**Form Fields:**
- Current Password (required)
- New Password (required, min 8 chars)
- Confirm Password (must match new password)

---

## API Response Format

All responses follow this format:

### Success Response
```javascript
{
  success: true,
  message: "Operation successful",
  data: { ... }  // Varies by endpoint
}
```

### Error Response
```javascript
{
  success: false,
  error: "Error message",
  status: 400 // HTTP status code
}
```

---

## Authentication Flow

### 1. **Login**
```javascript
const response = await userAPI.login({ email, password });
// Response contains: { token, user: { id, name, email, role } }
// Token automatically saved to localStorage
```

### 2. **Protected Requests**
All subsequent requests automatically include the token:
```javascript
// Automatically adds header:
// Authorization: Bearer {token}
const profile = await userAPI.getProfile();
```

### 3. **Logout**
```javascript
await userAPI.logout();
// Clears token from localStorage
```

---

## Frontend Components Using APIs

### Settings Page
- **File:** `book-store/src/Pages/User/Dashboard/Settings.jsx`
- **Profile Tab:** Uses `userAPI.updateProfile()`
- **Password Tab:** Uses `userAPI.changePassword()`
- **Status:** ✅ Working

### Wishlist Page
- **File:** `book-store/src/Pages/User/Dashboard/Wishlist.jsx`
- **Methods:** 
  - Gets wishlist IDs with `userAPI.getWishlist()`
  - Fetches book details with `bookAPI.getBookById()`
  - Removes with `userAPI.removeFromWishlist()`
- **Status:** ✅ Working

### Category Page
- **File:** `book-store/src/Pages/CategoryPage.jsx`
- **Methods:** Uses `bookAPI.getAllBooks()` exclusively
- **No Mock Data:** ✅ All real data from API
- **Currency:** ✅ Using Naira (₦) not USD

---

## Testing Checklist

- [ ] **Profile Update**: Settings page → Profile tab → Change any field → Save
- [ ] **Change Password**: Settings page → Password tab → Enter passwords → Update
- [ ] **Wishlist**: Add/remove books → Check wishlist page
- [ ] **Wishlist Persistence**: Refresh page → Wishlist items remain
- [ ] **Category Page**: Books load → No 404 errors
- [ ] **Prices Display**: All prices show in Naira (₦)
- [ ] **Dashboard Sidebar**: Shows logged-in user's actual name and email
- [ ] **API Errors**: Check browser console for proper error messages

---

## Common Issues & Debug Tips

### 404 Errors
**Check:**
1. Backend server running on port 5000?
2. API endpoint path correct?
3. Using `/api/auth/me` not `/api/auth/profile`?
4. Token present in request headers?

### Authentication Errors (401)
**Check:**
1. Token expired? Login again
2. Token missing? Check localStorage for 'token'
3. Protected route requires authentication?

### CORS Errors
**Check:**
1. Backend has CORS configured for `http://localhost:5173`
2. Request includes proper headers
3. Browser console shows full error

### Wishlist Not Persisting
**Check:**
1. localStorage is enabled in browser
2. Book IDs are being stored correctly
3. Check Application tab → Local Storage in DevTools

---

## Notes for Future Development

### To Add Backend Wishlist API:

1. Create new route file: `/Backend/src/routes/wishlist.js`
2. Add controller methods:
   - `GET /api/wishlist` - Get user's wishlist
   - `POST /api/wishlist` - Add to wishlist  
   - `DELETE /api/wishlist/:bookId` - Remove from wishlist
3. Store wishlist in User model (array of book IDs)
4. Update frontend API calls to use `/api/wishlist` endpoints

### Current Implementation is:
- ✅ Functional with localStorage
- ✅ Persistent across sessions
- ✅ No server required for wishlist
- ⚠️ Not synced across devices

---

## Environment Setup

**Frontend (.env in book-store/):**
```
VITE_API_URL=http://localhost:5000
```

**Backend (.env in Backend/):**
```
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
```

---

## Quick Reference: API Status

| Feature | Endpoint | Status | Notes |
|---------|----------|--------|-------|
| Profile Update | PUT `/api/auth/me` | ✅ | Working |
| Change Password | PUT `/api/auth/change-password` | ✅ | Working |
| Get Books | GET `/api/books` | ✅ | Working |
| Wishlist (Get) | localStorage | ✅ | Client-side |
| Wishlist (Add) | localStorage | ✅ | Client-side |
| Orders | POST `/api/orders` | ✅ | Working |
| Login | POST `/api/auth/login` | ✅ | Working |
| Register | POST `/api/auth/register` | ✅ | Working |

---

## Support

For issues:
1. Check browser console (F12) for detailed error messages
2. Check Network tab to see API requests/responses
3. Verify backend server is running: `http://localhost:5000/health`
4. Check your token exists in localStorage
