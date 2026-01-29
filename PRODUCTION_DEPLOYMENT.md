# Estarr BookStore - Production Deployment Guide

## Pre-Deployment Checklist

### Backend Configuration

#### 1. Environment Variables (.env)
```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookstore?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secure_random_string_here
JWT_EXPIRE=7d

# Frontend URLs
FRONTEND_URL=https://yourdomain.com
PRODUCTION_URL=https://yourdomain.com

# Email (Gmail)
EMAIL_ADDRESS_TO_SEND_CODE=your_email@gmail.com
PASSWORD_TO_EMAIL_ADDRESS_TO_SEND_CODE=your_app_specific_password
EMAIL_CHECK_ACCESS_KEY=your_verification_key

# Korapay Payment Gateway
KORAPAY_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxx  # Get from Korapay dashboard
KORAPAY_SECRET_KEY=sk_live_xxxxxxxxxxxxxxx  # Get from Korapay dashboard

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Backend URL (for webhooks)
BACKEND_URL=https://api.yourdomain.com

# Admin Route
ADMIN_ROUTE_NAME=admin
```

#### 2. Korapay Integration Setup
1. Sign up at [korapay.com](https://korapay.com)
2. Complete KYC verification
3. Get your API keys from the dashboard
4. Set webhook URL: `https://yourdomain.com/api/payments/korapay-webhook`
5. Test in sandbox environment first

#### 3. Bank Account Setup
- Access admin panel at `/admin/login`
- Go to Payment Management
- Add your business bank account details
- Mark one account as primary

#### 4. File Uploads Directory
```bash
mkdir -p public/uploads/payments
chmod 755 public/uploads/payments
```

### Frontend Configuration

#### 1. Environment Variables (.env)
```env
VITE_API_URL=https://api.yourdomain.com
VITE_ADMIN_ROUTE=admin
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_PRODUCTION_API_URL=https://api.yourdomain.com
```

#### 2. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins and redirect URIs
6. Copy Client ID to .env

#### 3. Build Production
```bash
npm run build
# This creates a dist/ folder with optimized files
```

### Deployment Platforms

#### Option 1: Render (Recommended for Backend)
1. Connect GitHub repo
2. Create new Web Service from GitHub
3. Set environment variables
4. Deploy

#### Option 2: Vercel (For Frontend)
1. Connect GitHub repo
2. Set environment variables
3. Deploy automatically on push

#### Option 3: DigitalOcean / AWS
- Use app.json configuration
- Set up CI/CD pipeline
- Configure SSL certificates

## Security Hardening

### Backend Security
✓ HTTPS/SSL enabled
✓ CORS properly configured
✓ Helmet.js security headers
✓ Rate limiting enabled
✓ Login attempt limiting (5 tries/hour)
✓ JWT tokens with expiration
✓ Password hashing with bcryptjs
✓ Input validation and sanitization
✓ MongoDB connection secured
✓ Sensitive data in environment variables

### Frontend Security
✓ Environment variables not exposed
✓ Secure token storage in localStorage
✓ HTTPS enforcement
✓ CSP headers configured
✓ Input validation on forms
✓ Protected routes for authenticated users
✓ Admin routes double-checked

### Payment Security
✓ Korapay SSL/TLS encryption
✓ Webhook signature verification
✓ File upload validation (type, size)
✓ Manual payment proof verification
✓ No sensitive data in logs

## Performance Optimization

### Backend
- ✓ Compression middleware enabled
- ✓ Rate limiting to prevent abuse
- ✓ Database indexes on frequently queried fields
- ✓ API response caching where applicable

### Frontend
- ✓ Code splitting with React Router
- ✓ Lazy loading images
- ✓ Minified assets
- ✓ Gzip compression
- ✓ CDN for static assets

## Database Backup

### MongoDB Atlas
1. Enable automated backups (daily)
2. Store backups for 30+ days
3. Test recovery procedures monthly

## Monitoring & Logging

### Backend
- Monitor error rates
- Track payment webhook failures
- Monitor database performance
- CPU and memory usage

### Frontend
- Monitor load times
- Track user interactions
- Error logging service

## Payment Processing Workflow

### Korapay (Card Payment)
```
1. User selects Korapay payment
2. Frontend calls /api/payments/korapay/initialize
3. Redirect to Korapay checkout
4. Korapay processes payment
5. Webhook confirms payment
6. Order marked as "processing"
7. Admin notified
```

### Manual Bank Transfer
```
1. User selects manual transfer
2. Frontend shows bank account details
3. User makes transfer externally
4. User uploads proof of payment
5. Payment status: "processing"
6. Admin reviews proof
7. Admin approves/rejects
8. Order processed accordingly
```

## Post-Deployment

### First Steps
1. Test all payment methods in production
2. Verify webhook delivery
3. Test email notifications
4. Monitor error logs for 24 hours
5. Test user registration flow
6. Test admin approval workflow

### Ongoing Maintenance
- Weekly: Check error logs
- Daily: Monitor database size
- Monthly: Review performance metrics
- Quarterly: Security audit
- Annually: Complete system audit

## Troubleshooting

### Common Issues

**Korapay Payments Not Working**
- Verify API keys are correct
- Check webhook URL is accessible
- Ensure firewall allows Korapay IPs
- Check logs for webhook failures

**Email Not Sending**
- Verify Gmail app-specific password
- Check "Less secure apps" setting
- Verify sender email is correct

**Images Not Loading**
- Verify Cloudinary credentials
- Check image upload path
- Ensure public/uploads folder exists

**Rate Limiting Issues**
- Check client IP configuration
- Verify rate limit settings
- Review Redis cache status (if used)

## Rollback Procedure

### If Critical Issues Occur
```bash
# 1. Identify the issue
# 2. Revert to last stable version
git revert <commit-hash>

# 3. Deploy previous version
# 4. Notify users of temporary issues
# 5. Debug in development environment
# 6. Test fix thoroughly
# 7. Deploy corrected version
```

## Contact & Support

### During Production Issues
1. Check error logs first
2. Review recent deployments
3. Test in development environment
4. Gradual rollout for fixes
5. Monitor impact of changes

---

**Last Updated:** January 2026
**Next Review:** April 2026
