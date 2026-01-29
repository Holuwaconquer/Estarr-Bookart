import helmet from 'helmet';
import crypto from 'crypto';

export const securityMiddleware = (app) => {
  // Generate nonce for CSP
  app.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString('hex');
    next();
  });

  // Content Security Policy
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com"
        ],
        scriptSrc: [
          "'self'",
          (req, res) => `'nonce-${res.locals.cspNonce}'`,
          "https://js.stripe.com"
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: [
          "'self'",
          "data:",
          "https://res.cloudinary.com",
          "https://*.cloudinary.com"
        ],
        connectSrc: [
          "'self'",
          process.env.API_URL,
          "https://api.stripe.com",
          "wss://*.pusher.com"
        ],
        frameSrc: ["'self'", "https://js.stripe.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    })
  );

  // Rate limiting by IP and endpoint
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    keyGenerator: (req) => {
      return req.ip + req.path; // Different limit for different endpoints
    },
    message: 'Too many requests from this IP, please try again later.',
  });

  app.use('/api/', limiter);

  // Prevent brute force
  const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 login attempts per hour
    message: 'Too many login attempts. Please try again later.',
    skipSuccessfulRequests: true,
  });

  app.use('/api/auth/login', loginLimiter);
};