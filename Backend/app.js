require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./src/config/database');

const bookRoutes = require('./src/routes/books');
const orderRoutes = require('./src/routes/orders');
const paymentRoutes = require('./src/routes/payments');
const blogRoutes = require('./src/routes/blog');
const reviewRoutes = require('./src/routes/review');
const categoryRoutes = require('./src/routes/categories');
const bankAccountRoutes = require('./src/routes/bankAccounts');
const shippingLocationRoutes = require('./src/routes/shippingLocations');
const emailRoutes = require('./src/routes/emails');
const questpayWebhookRoutes = require('./src/routes/questpayWebhook');
const userRoutes = require('./src/routes/users');

const app = express();
app.set('trust proxy', 1);

app.use(cookieParser());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:', 'http:'],
      connectSrc: ["'self'", 'https://api.korapay.com', 'https://api-sandbox.korapay.com', 'http:'],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", 'http:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.PRODUCTION_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://estarrbookart.vercel.app',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy: This origin is not allowed'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role'],
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.use('/api/users/login', rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true,
}));

app.use(compression());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV,
  });
});

app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.use(
  process.env.QUESTPAY_WEBHOOK_PATH || '/api/webhooks/questpay',
  express.raw({ type: 'application/json', limit: '1mb' }),
  questpayWebhookRoutes,
);
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true, limit: '4mb' }));

if (!process.env.VERCEL) {
  app.use('/uploads', cors({
    origin: '*',
    credentials: false,
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }), express.static(path.join(__dirname, 'public', 'uploads'), {
    setHeaders: (res) => {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Cache-Control', 'public, max-age=3600');
    },
  }));
}

app.use((req, res, next) => {
  req.id = require('crypto').randomUUID();
  next();
});

app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);
app.use('/api/shipping-locations', shippingLocationRoutes);
app.use('/api/emails', emailRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
