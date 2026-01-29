# Backend API Routes - Complete Reference

## Server Configuration
- **Base URL**: `http://localhost:5000`
- **API Prefix**: `/api`
- **Full API Base**: `http://localhost:5000/api`

---

## Authentication Routes (`/api/auth`)

### Public Routes
| Method | Endpoint | Purpose | Frontend Method |
|--------|----------|---------|-----------------|
| POST | `/auth/register` | Register new user | `userAPI.register()` |
| POST | `/auth/login` | User login | `userAPI.login()` |
| POST | `/auth/forgot-password` | Request password reset | `userAPI.forgotPassword()` |
| PUT | `/auth/reset-password/:token` | Reset password with token | `userAPI.resetPassword()` |

### Protected Routes (Require JWT Token)
| Method | Endpoint | Purpose | Frontend Method |
|--------|----------|---------|-----------------|
| GET | `/auth/me` | Get current user profile | `userAPI.getProfile()` |
| PUT | `/auth/me` | Update user profile | `userAPI.updateProfile()` |
| POST | `/auth/change-password` | Change user password | `userAPI.changePassword()` |

---

## Books Routes (`/api/books`)

### Public Routes
| Method | Endpoint | Purpose | Frontend Method |
|--------|----------|---------|-----------------|
| GET | `/books` | Get all books (with pagination & filters) | `bookAPI.getAllBooks()` |
| GET | `/books/:id` | Get single book by ID | `bookAPI.getBookById()` |
| GET | `/books/featured` | Get featured books | (Used internally) |
| GET | `/books/bestsellers` | Get bestseller books | (Used internally) |
| GET | `/books/new-arrivals` | Get new arrival books | (Used internally) |
| GET | `/books/category/:category` | Get books by category | `categoryAPI.getCategoryBySlug()` |

### Protected Admin Routes (Require JWT + Admin Role)
| Method | Endpoint | Purpose | Frontend Method |
|--------|----------|---------|-----------------|
| POST | `/books` | Create new book | `bookAPI.createBook()` |
| PUT | `/books/:id` | Update book details | `bookAPI.updateBook()` |
| DELETE | `/books/:id` | Delete book | `bookAPI.deleteBook()` |

**Query Parameters for GET /api/books:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)
- `category` - Filter by category
- `featured` - Filter featured books (true/false)
- `bestseller` - Filter bestsellers (true/false)
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `search` - Text search
- `sort` - Sort order (default: '-createdAt')

---

## Orders Routes (`/api/orders`)

### Protected User Routes (Require JWT Token)
| Method | Endpoint | Purpose | Frontend Method |
|--------|----------|---------|-----------------|
| POST | `/orders` | Create new order | `orderAPI.createOrder()` |
| GET | `/orders/my-orders` | Get user's orders | `orderAPI.getMyOrders()` |
| GET | `/orders/:id` | Get single order | `orderAPI.getOrderById()` |
| PUT | `/orders/:id/cancel` | Cancel user's order | `orderAPI.cancelOrder()` |
| PUT | `/orders/:id/payment-status` | Update payment status | `orderAPI.updatePaymentStatus()` |

### Protected Admin Routes (Require JWT + Admin Role)
| Method | Endpoint | Purpose | Frontend Method |
|--------|----------|---------|-----------------|
| GET | `/orders` | Get all orders | `orderAPI.getAllOrders()` |
| PUT | `/orders/:id/status` | Update order status | `orderAPI.updateOrderStatus()` |

---

## Payments Routes (`/api/payments`)

### Public Routes
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/payments/korapay-webhook` | Webhook for payment verification |
| GET | `/payments/bank-accounts` | Get bank account details |

### Protected User Routes (Require JWT Token)
| Method | Endpoint | Purpose | Frontend Method |
|--------|----------|---------|-----------------|
| POST | `/payments/korapay/initialize` | Initialize Korapay payment | `userAPI.initializeKorapayPayment()` |
| POST | `/payments/korapay/verify` | Verify Korapay payment | `userAPI.verifyKorapayPayment()` |
| POST | `/payments/manual-transfer/create` | Create manual transfer payment | `userAPI.createManualTransferPayment()` |
| POST | `/payments/:paymentId/upload-proof` | Upload payment proof | `userAPI.uploadProofOfPayment()` |
| GET | `/payments/:paymentId` | Get payment details | `userAPI.getPaymentDetails()` |
| GET | `/payments/my-payments` | Get user's payments | `userAPI.getMyPayments()` |

### Protected Admin Routes (Require JWT + Admin Role)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/payments/admin/payments` | Get all payments |
| PUT | `/payments/admin/payments/:paymentId/verify` | Verify manual payment |
| POST | `/payments/admin/bank-accounts` | Add bank account |
| GET | `/payments/admin/bank-accounts` | Get bank accounts |

---

## Blog Routes (`/api/blog`)

### Public Routes
| Method | Endpoint | Purpose | Frontend Method |
|--------|----------|---------|-----------------|
| GET | `/blog` | Get all blog posts | `blogAPI.getAllBlogs()` |
| GET | `/blog/categories` | Get blog categories | `blogAPI.getCategories()` |
| GET | `/blog/:slug` | Get blog by slug | `blogAPI.getBlogBySlug()` |
| POST | `/blog/:id/like` | Like a blog post | `blogAPI.likeBlog()` |

### Protected User Routes (Require JWT Token)
| Method | Endpoint | Purpose | Frontend Method |
|--------|----------|---------|---|
| POST | `/blog/:id/comments` | Add comment to blog | `blogAPI.addComment()` |

### Protected Admin Routes (Require JWT + Admin Role)
| Method | Endpoint | Purpose | Frontend Method |
|--------|----------|---------|---|
| POST | `/blog` | Create blog post | `blogAPI.createBlog()` |
| GET | `/blog/admin/all` | Get all admin blogs | `blogAPI.getAdminBlogs()` |
| GET | `/blog/admin/:id` | Get single blog (admin) | `blogAPI.getBlogById()` |
| PUT | `/blog/:id` | Update blog post | `blogAPI.updateBlog()` |
| DELETE | `/blog/:id` | Delete blog post | `blogAPI.deleteBlog()` |

---

## Reviews Routes (`/api/reviews`)

### Public Routes
| Method | Endpoint | Purpose | Frontend Method |
|--------|----------|---------|---|
| GET | `/reviews/book/:bookId` | Get reviews for book | `reviewAPI.getBookReviews()` |
| POST | `/reviews/:id/helpful` | Mark review as helpful | `reviewAPI.markHelpful()` |
| POST | `/reviews/:id/unhelpful` | Mark review as unhelpful | `reviewAPI.markUnhelpful()` |

### Protected User Routes (Require JWT Token)
| Method | Endpoint | Purpose | Frontend Method |
|--------|----------|---------|---|
| POST | `/reviews` | Add review | `reviewAPI.addReview()` |
| GET | `/reviews/my-reviews` | Get user's reviews | `reviewAPI.getMyReviews()` |
| PUT | `/reviews/:id` | Update review | `reviewAPI.updateReview()` |
| DELETE | `/reviews/:id` | Delete review | `reviewAPI.deleteReview()` |

---

## Common Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## Authentication

### Token Storage
- Token is stored in `localStorage` with key `token`
- Retrieved via `localStorage.getItem('token')`

### Token Usage
All protected routes require the Authorization header:
```
Authorization: Bearer <token>
```

---

## Important Notes

1. **Admin Routes** require both JWT token AND admin role authorization
2. **Categories** are stored as a property of books (string field), not as separate entities
3. **User Wishlist** is stored in `localStorage` - no backend endpoint exists
4. **Pagination** defaults: page=1, limit=12
5. **User Profile** is stored at root level of User model with fields:
   - `name`, `email`, `phone`, `address`, `city`, `state`, `zipCode`, `country`
   - Also has `shippingAddress` object for compatibility

---

## Fixed Issues (Jan 19, 2026)

### ❌ Incorrect Routes (Previously Used)
- ❌ `POST /api/books/admin/create` → ✅ `POST /api/books`
- ❌ `PUT /api/books/admin/:id` → ✅ `PUT /api/books/:id`
- ❌ `DELETE /api/books/admin/:id` → ✅ `DELETE /api/books/:id`
- ❌ `/api/categories/*` → ✅ Use `/api/books/category/:category`
- ❌ `categoryAPI.getCategories()` → ✅ `categoryAPI.getAllCategories()`

### ✅ Fixed Files
- [api.js](book-store/src/services/api.js) - All endpoints corrected
- [Shop.jsx](book-store/src/Pages/Shop.jsx) - categoryAPI call corrected

