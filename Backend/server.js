require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const https = require('https');
const http = require('http');

// Import routes
const bookRoutes = require('./src/routes/books');
const orderRoutes = require('./src/routes/orders');
const paymentRoutes = require('./src/routes/payments');
const blogRoutes = require('./src/routes/blog');
const reviewRoutes = require('./src/routes/review');
const categoryRoutes = require('./src/routes/categories');
const bankAccountRoutes = require('./src/routes/bankAccounts');
const userRoutes = require('./src/routes/users');

const app = express();

// Add cookie parser middleware (IMPORTANT for auth)
app.use(cookieParser());

// Enhanced security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:", "http:", "https:"],
      connectSrc: ["'self'", "https://api.korapay.com", "https://api-sandbox.korapay.com", "http:"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "http:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.PRODUCTION_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://estarrbookart.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin like mobile apps or curl
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy: This origin is not allowed'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role'],
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Don't rate limit health checks
    return req.path === '/health' || req.path === '/keep-alive';
  }
});

app.use('/api', apiLimiter);

// Login rate limiting (stricter)
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true
});

app.use('/api/users/login', loginLimiter);

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads - with explicit CORS middleware
app.use('/uploads', cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}), express.static('public/uploads', {
  setHeaders: (res, path) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'public, max-age=3600');
  }
}));

// Request ID middleware for logging
app.use((req, res, next) => {
  req.id = require('crypto').randomUUID();
  next();
});

// Database connection with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Retry after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Keep-alive endpoint (no rate limiting)
app.get('/keep-alive', (req, res) => {
  res.status(200).json({ 
    status: 'alive', 
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

// ============ KEEP-ALIVE MECHANISM ============
// This prevents the server from sleeping on free tiers

let keepAliveInterval = null;
let consecutiveFailures = 0;
const MAX_FAILURES = 3;

const performKeepAlive = () => {
  // Options for the keep-alive request
  const options = {
    hostname: 'localhost',
    port: PORT,
    path: '/keep-alive',
    method: 'GET',
    timeout: 5000 // 5 second timeout
  };

  const req = http.request(options, (res) => {
    // Reset failure counter on success
    consecutiveFailures = 0;
    console.log(`💓 Keep-alive ping successful at ${new Date().toISOString()}`);
  });

  req.on('error', (err) => {
    consecutiveFailures++;
    console.error(`⚠️ Keep-alive ping failed (${consecutiveFailures}/${MAX_FAILURES}):`, err.message);
    
    // If we have too many failures, restart the keep-alive interval
    if (consecutiveFailures >= MAX_FAILURES) {
      console.error('🚨 Too many keep-alive failures. Server might be unresponsive!');
      // Don't crash the server, just log the error
    }
  });

  req.on('timeout', () => {
    req.destroy();
    console.error('❌ Keep-alive request timeout');
  });

  req.end();
};

// Also ping external URLs if you have a public URL (for Render/Heroku)
const performExternalKeepAlive = () => {
  const externalUrl = process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL;
  
  if (!externalUrl) {
    // If no external URL is set, only ping locally
    return;
  }

  const url = `${externalUrl}/keep-alive`;
  
  const req = https.request(url, { timeout: 10000 }, (res) => {
    console.log(`🌐 External keep-alive ping to ${externalUrl} successful`);
  });

  req.on('error', (err) => {
    console.error(`⚠️ External keep-alive failed:`, err.message);
  });

  req.on('timeout', () => {
    req.destroy();
    console.error('❌ External keep-alive timeout');
  });

  req.end();
};

// Start the keep-alive mechanism
const startKeepAlive = () => {
  // Clear existing interval if any
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
  
  // Ping every 4 minutes (240,000 ms) - Render free tier sleep after 15 minutes of inactivity
  keepAliveInterval = setInterval(() => {
    performKeepAlive();
    
    // Also ping external URL if available (for cloud platforms)
    if (process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL) {
      performExternalKeepAlive();
    }
  }, 4 * 60 * 1000); // 4 minutes
  
  console.log('⏰ Keep-alive service started (every 4 minutes)');
};

// Graceful shutdown - clean up keep-alive interval
const gracefulShutdown = () => {
  console.log('👋 Shutting down gracefully...');
  
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    console.log('✅ Keep-alive interval cleared');
  }
  
  mongoose.connection.close(false, () => {
    console.log('✅ MongoDB connection closed.');
    process.exit(0);
  });
};

// Start server only after DB connection
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`💻 Host: ${process.env.HOST || 'localhost'}`);
    
    // Start keep-alive mechanism (only in production)
    if (process.env.NODE_ENV === 'production') {
      startKeepAlive();
      console.log('🔋 Keep-alive mechanism enabled for production');
    } else {
      console.log('🔋 Keep-alive mechanism disabled in development');
    }
  });
  
  // Handle server errors
  server.on('error', (error) => {
    console.error('❌ Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please free the port and restart.`);
      process.exit(1);
    }
  });
  
}).catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

// Graceful shutdown handlers
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  gracefulShutdown();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});