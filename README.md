# Estarr BookStore - Premium Book E-commerce Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.4%2B-green)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-19%2B-blue)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A modern, full-stack e-commerce platform for selling premium books with secure payment integration, admin dashboard, and responsive design.

## 🚀 Features

### User Features
- ✅ User authentication with JWT
- ✅ Browse and search books
- ✅ Shopping cart management
- ✅ Multiple payment methods:
  - 💳 Korapay (card payments)
  - 🏦 Manual bank transfer with proof upload
- ✅ Order tracking
- ✅ Wishlist management
- ✅ User dashboard
- ✅ Password reset functionality
- ✅ OAuth integration (Google/Facebook)

### Admin Features
- ✅ Admin dashboard
- ✅ Payment management
- ✅ Manual payment verification
- ✅ Bank account management
- ✅ Order management
- ✅ User management
- ✅ Book catalog management

### Technical Features
- ✅ Responsive design (mobile-first)
- ✅ Production-grade security
- ✅ Rate limiting & DDoS protection
- ✅ Input validation & sanitization
- ✅ SSL/TLS encryption
- ✅ CORS & CSRF protection
- ✅ Secure password hashing
- ✅ Database backups

## 📋 System Requirements

- Node.js v18 or higher
- MongoDB (Atlas or local)
- npm or yarn

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd StoreApp
```

### 2. Backend Setup
```bash
cd Backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configurations
# See PRODUCTION_DEPLOYMENT.md for detailed setup
nano .env

# Start development server
npm run dev

# Start production server
npm start
```

### 3. Frontend Setup
```bash
cd ../book-store

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configurations
nano .env

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔧 Configuration

### Backend Environment Variables
See [Backend .env.example](Backend/.env.example) for all required variables:
- MongoDB connection string
- JWT secret key
- Korapay API keys
- Email configuration
- Frontend URLs
- Cloudinary credentials (optional)

### Frontend Environment Variables
See [Frontend .env.example](book-store/.env.example) for all required variables:
- API URL
- Google Client ID
- Facebook App ID
- Admin route name

## 💳 Payment Integration

### Korapay Setup
1. Sign up at [korapay.com](https://korapay.com)
2. Complete KYC verification
3. Get API keys from dashboard
4. Add to `.env`:
   ```env
   KORAPAY_PUBLIC_KEY=pk_live_xxxxx
   KORAPAY_SECRET_KEY=sk_live_xxxxx
   ```

### Manual Bank Transfer
1. Access admin panel: `/admin/login`
2. Go to Payment Management
3. Add your bank account details
4. Users can transfer and upload proof

## 🗄️ Database Setup

### MongoDB Atlas (Recommended for Production)
1. Create account at [mongodb.com](https://mongodb.com)
2. Create a cluster
3. Get connection string
4. Add to `.env`: `MONGODB_URI=mongodb+srv://...`

### Local MongoDB
```bash
# Install MongoDB
# Start MongoDB service
mongod

# Connection string
mongodb://localhost:27017/bookstore
```

## 📊 API Documentation

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset

#### Books
- `GET /api/books` - List all books
- `GET /api/books/:id` - Get single book
- `GET /api/books/search?q=...` - Search books

#### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get order details

#### Payments
- `POST /api/payments/korapay/initialize` - Start Korapay payment
- `POST /api/payments/korapay/verify` - Verify Korapay payment
- `POST /api/payments/manual-transfer/create` - Create manual transfer
- `POST /api/payments/:id/upload-proof` - Upload proof
- `GET /api/payments/bank-accounts` - Get bank accounts

See full API docs in [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## 🚀 Deployment

### Render (Backend)
1. Connect GitHub repository
2. Create new Web Service
3. Set environment variables
4. Deploy

### Vercel (Frontend)
1. Connect GitHub repository
2. Import project
3. Set environment variables
4. Deploy

See detailed instructions in [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)

## 🔒 Security

- Production-grade encryption (HTTPS/TLS)
- JWT authentication with expiration
- Bcryptjs password hashing
- Rate limiting (200 req/15 min)
- Login attempt limiting (5/hour)
- Input validation & sanitization
- CORS & CSRF protection
- Helmet.js security headers
- MongoDB Atlas IP whitelist

See [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) for complete security details.

## 📱 Responsive Design

- Mobile-first approach
- Tailwind CSS responsive utilities
- Optimized for all screen sizes
- Touch-friendly UI
- Progressive enhancement

## 🧪 Testing

### Run Tests
```bash
# Backend
cd Backend
npm test

# Frontend
cd book-store
npm test
```

### Integration Testing
```bash
# Backend
npm run integration-test
npm run full-integration-test
```

## 📝 Project Structure

```
StoreApp/
├── Backend/
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utilities
│   ├── tests/               # Test files
│   └── server.js            # Entry point
│
└── book-store/
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── Pages/           # Page components
    │   ├── contexts/        # React contexts
    │   ├── services/        # API services
    │   └── layouts/         # Layout components
    └── vite.config.js       # Vite configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For issues and questions:
- Check [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for deployment help
- Review [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) for security guidance
- Check error logs for debugging
- See API documentation for endpoint details

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🎉 Getting Started

### Quick Start (Development)
```bash
# Terminal 1 - Backend
cd Backend
npm install
npm run dev  # Runs on localhost:5000

# Terminal 2 - Frontend
cd book-store
npm install
npm run dev  # Runs on localhost:5173

# Visit http://localhost:5173
```

### First User Actions
1. Register new account at `/register`
2. Browse books at `/category`
3. Add books to cart
4. Checkout with payment method
5. Try admin login at `/admin/login` (username: admin, password: admin)

### Next Steps for Production
1. Configure Korapay payment gateway
2. Setup bank account for manual transfers
3. Deploy to production (see PRODUCTION_DEPLOYMENT.md)
4. Test all payment methods
5. Monitor logs and performance

## 🌟 Features Roadmap

- [ ] Advanced search filters
- [ ] Book recommendations
- [ ] User reviews & ratings
- [ ] Loyalty points system
- [ ] SMS notifications
- [ ] Multi-language support
- [ ] Bulk order management
- [ ] Advanced analytics

## 👨‍💻 Author

**Estarr BookStore Development Team**

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Status**: Production Ready ✅

For more information, see the complete documentation in the root directory.
