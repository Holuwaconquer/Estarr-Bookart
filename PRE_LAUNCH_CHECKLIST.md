# ✅ Final Pre-Launch Checklist

**Project**: Estarr BookStore  
**Date**: January 18, 2026  
**Version**: 1.0.0  
**Status**: Ready for Production

---

## 🔧 Pre-Deployment Configuration

### Backend Setup
- [ ] Copy `Backend/.env.example` to `Backend/.env`
- [ ] Set `NODE_ENV=production`
- [ ] Configure `MONGODB_URI` with production database
- [ ] Generate secure `JWT_SECRET` (32+ random characters)
- [ ] Set `JWT_EXPIRE=7d`
- [ ] Configure email settings (Gmail app password)
- [ ] Add Korapay production keys:
  - [ ] `KORAPAY_PUBLIC_KEY=pk_live_xxxxx`
  - [ ] `KORAPAY_SECRET_KEY=sk_live_xxxxx`
- [ ] Set production URLs:
  - [ ] `FRONTEND_URL=https://yourdomain.com`
  - [ ] `PRODUCTION_URL=https://yourdomain.com`
  - [ ] `BACKEND_URL=https://api.yourdomain.com`
- [ ] Set `ADMIN_ROUTE_NAME=admin` (can be changed for security)
- [ ] Configure Cloudinary (optional but recommended)

### Frontend Setup
- [ ] Copy `book-store/.env.example` to `book-store/.env`
- [ ] Set `VITE_API_URL=https://api.yourdomain.com`
- [ ] Set `VITE_PRODUCTION_API_URL=https://api.yourdomain.com`
- [ ] Configure Google OAuth credentials (if using)
- [ ] Configure Facebook App ID (if using)
- [ ] Verify `VITE_ADMIN_ROUTE=admin` matches backend

### Database Setup
- [ ] Create MongoDB Atlas account
- [ ] Create production cluster
- [ ] Add IP whitelist (all IPs during testing: 0.0.0.0/0)
- [ ] Create database user
- [ ] Enable automatic backups
- [ ] Set backup retention to 30+ days
- [ ] Create initial indexes
- [ ] Test connection string

---

## 💳 Payment Integration Setup

### Korapay Configuration
- [ ] Sign up at korapay.com
- [ ] Complete KYC verification
- [ ] Access dashboard
- [ ] Get production API keys
- [ ] Copy to `.env` file
- [ ] Test with sandbox credentials first
- [ ] Set webhook URL: `https://yourdomain.com/api/payments/korapay-webhook`
- [ ] Verify webhook delivery in Korapay dashboard
- [ ] Switch to production credentials after testing

### Bank Account Setup
- [ ] Access admin panel (http://localhost:5173/admin/login)
- [ ] Navigate to Payment Management
- [ ] Click "Add Account"
- [ ] Enter business bank account details:
  - [ ] Account Name
  - [ ] Account Number
  - [ ] Bank Name
  - [ ] Bank Code
- [ ] Mark as Primary (if first account)
- [ ] Save

### File Uploads Directory
- [ ] Create directory: `mkdir -p public/uploads/payments`
- [ ] Set permissions: `chmod 755 public/uploads/payments`
- [ ] Test file upload functionality
- [ ] Verify files are stored securely

---

## 🔐 Security Verification

### Backend Security
- [ ] Helmet.js security headers enabled
- [ ] CORS configured for specific origins only
- [ ] Rate limiting enabled (200 req/15 min)
- [ ] Login rate limiting enabled (5 attempts/hour)
- [ ] JWT tokens have expiration
- [ ] Passwords hashed with bcryptjs
- [ ] Environment variables not exposed
- [ ] Error messages don't leak information
- [ ] HTTPS/TLS enforced
- [ ] Database credentials in environment only
- [ ] API keys in environment only
- [ ] No hardcoded sensitive data
- [ ] Input validation on all endpoints
- [ ] File upload validation enabled
- [ ] Webhook signature verification enabled

### Frontend Security
- [ ] No API keys in code
- [ ] No passwords stored permanently
- [ ] HTTPS enforced in production
- [ ] Protected routes for authenticated users
- [ ] Admin routes double-checked
- [ ] Input validation on forms
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented

### Payment Security
- [ ] Korapay SSL/TLS enabled
- [ ] Webhook signature verification working
- [ ] File upload types whitelisted (JPG, PNG, GIF, PDF)
- [ ] File size limit enforced (5MB)
- [ ] Payment amounts validated
- [ ] No card data stored locally
- [ ] No payment details in logs

---

## 📱 Responsive Design Testing

### Mobile Testing (< 640px)
- [ ] Test on iPhone SE (375px)
- [ ] Test on iPhone 12 (390px)
- [ ] Test on Android small (360px)
- [ ] Navigation collapses properly
- [ ] Cart displays correctly
- [ ] Checkout flows smoothly
- [ ] Buttons are touch-friendly
- [ ] Forms are readable
- [ ] No horizontal scroll

### Tablet Testing (640px - 1024px)
- [ ] iPad layout looks good
- [ ] Navigation works
- [ ] Content properly spaced
- [ ] Images scale correctly

### Desktop Testing (> 1024px)
- [ ] Full layout displays
- [ ] Sidebar visible
- [ ] No excessive white space
- [ ] Everything aligned

### Cross-Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## 🧪 Functional Testing

### User Registration & Login
- [ ] Registration form works
- [ ] Email validation works
- [ ] Password validation works
- [ ] Login successful
- [ ] Logout works
- [ ] Session persists
- [ ] Protected routes block non-auth users
- [ ] JWT tokens refresh properly

### Product Browsing
- [ ] Browse all books
- [ ] Search functionality works
- [ ] Filter by category
- [ ] Product details display
- [ ] Images load correctly
- [ ] Prices display correctly

### Cart & Checkout
- [ ] Add to cart works
- [ ] Remove from cart works
- [ ] Cart persists across pages
- [ ] Cart totals calculate correctly
- [ ] Shipping cost calculation works (>100 = free)
- [ ] Tax calculation works (10%)
- [ ] Checkout form validation works
- [ ] All form fields accept input

### Korapay Payment
- [ ] Payment initialization works
- [ ] Redirect to Korapay succeeds
- [ ] Test payment in Korapay
- [ ] Webhook triggers after payment
- [ ] Payment status updates to "completed"
- [ ] Order status updates to "processing"
- [ ] Confirmation email sent
- [ ] User sees success message

### Manual Bank Transfer
- [ ] Create manual transfer payment
- [ ] Bank details display correctly
- [ ] File upload accepts valid files
- [ ] File upload rejects invalid files
- [ ] File upload rejects large files (>5MB)
- [ ] Payment status shows "processing"
- [ ] Admin can see proof file
- [ ] Admin can approve payment
- [ ] Admin can reject payment with reason
- [ ] User gets email notification

### Admin Features
- [ ] Admin login works
- [ ] Admin dashboard accessible
- [ ] Payment Management tab visible
- [ ] Can view all payments
- [ ] Can filter by status
- [ ] Can view payment details
- [ ] Can see proof of payment
- [ ] Can approve payment
- [ ] Can reject payment
- [ ] Can add bank account
- [ ] Can edit bank account
- [ ] Can delete bank account

---

## 🚀 Deployment Checklist

### Render Backend Deployment
- [ ] Create Render account
- [ ] Connect GitHub repository
- [ ] Create new Web Service
- [ ] Configure environment variables
- [ ] Set build command
- [ ] Set start command
- [ ] Enable auto-deploy
- [ ] Deploy successfully
- [ ] Verify health check endpoint
- [ ] Test API endpoints work

### Vercel Frontend Deployment
- [ ] Create Vercel account
- [ ] Connect GitHub repository
- [ ] Import project
- [ ] Configure environment variables
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `dist`
- [ ] Deploy successfully
- [ ] Verify domain works
- [ ] Test all pages load

### Domain & DNS
- [ ] Register domain (if needed)
- [ ] Point DNS to deployment services
- [ ] Wait for DNS propagation (24-48 hours)
- [ ] Test domain resolution
- [ ] Verify HTTPS works

### SSL/TLS Certificates
- [ ] Request SSL certificate
- [ ] Verify certificate installation
- [ ] Test HTTPS connection
- [ ] Force HTTP → HTTPS redirect
- [ ] Verify certificate not expired

---

## 📊 Monitoring & Logging

### Backend Monitoring
- [ ] Set up error logging service
- [ ] Configure performance monitoring
- [ ] Set up uptime monitoring
- [ ] Configure payment webhook monitoring
- [ ] Set up database monitoring
- [ ] Configure alerts for errors
- [ ] Configure alerts for high latency

### Frontend Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure user analytics
- [ ] Set up page performance tracking
- [ ] Monitor broken links
- [ ] Track API errors

### Database Monitoring
- [ ] Set up backups
- [ ] Configure backup alerts
- [ ] Set up performance monitoring
- [ ] Configure storage alerts
- [ ] Test backup restoration

---

## 📝 Documentation

### Public Documentation
- [ ] README.md is complete
- [ ] Quick Reference updated
- [ ] API documentation available
- [ ] User guide ready

### Admin Documentation
- [ ] Admin setup guide ready
- [ ] Payment verification guide ready
- [ ] Troubleshooting guide complete
- [ ] Emergency procedures documented

### Developer Documentation
- [ ] Code comments added
- [ ] API docs complete
- [ ] Database schema documented
- [ ] Deployment guide complete
- [ ] Security guide complete

---

## 🎯 First Day Operations

### Morning Checklist
- [ ] Check all systems online
- [ ] Review error logs
- [ ] Verify database backup completed
- [ ] Check payment webhook status
- [ ] Monitor for user issues

### Throughout Day
- [ ] Monitor error logs hourly
- [ ] Check payment transactions
- [ ] Verify email deliveries
- [ ] Monitor server performance
- [ ] Respond to user issues

### End of Day
- [ ] Review all transactions
- [ ] Check system health
- [ ] Document any issues
- [ ] Plan for next day
- [ ] Backup critical data

---

## ⚠️ Known Limitations & TODOs

### Currently Hardcoded (Safe for MVP)
- [ ] Admin default credentials (change immediately)
- [ ] Tax rate 10% (make configurable)
- [ ] Shipping calculation logic
- [ ] Order statuses

### For Future Versions
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Recommendation engine
- [ ] Multi-language support
- [ ] Email templates (currently basic)
- [ ] SMS notifications
- [ ] Stripe/PayPal integration
- [ ] Bulk order management

---

## 🆘 Emergency Procedures

### If Payment System Down
1. [ ] Notify users of issue
2. [ ] Switch to manual payment only
3. [ ] Contact Korapay support
4. [ ] Check error logs
5. [ ] Verify webhook configuration
6. [ ] Test with API keys
7. [ ] Restart service if needed

### If Database Down
1. [ ] Notify users of maintenance
2. [ ] Restore from latest backup
3. [ ] Verify data integrity
4. [ ] Test all queries work
5. [ ] Monitor for issues
6. [ ] Update status page

### If Email Not Working
1. [ ] Check SMTP credentials
2. [ ] Verify email configuration
3. [ ] Check email service status
4. [ ] Test with debug mode
5. [ ] Use backup email service
6. [ ] Notify users of delays

### If Frontend Down
1. [ ] Check deployment status
2. [ ] Verify static files exist
3. [ ] Check CDN status
4. [ ] Re-deploy if needed
5. [ ] Clear browser cache
6. [ ] Test on incognito mode

### If Backend Down
1. [ ] Check deployment status
2. [ ] Verify environment variables
3. [ ] Check database connection
4. [ ] Check server logs
5. [ ] Restart service
6. [ ] Rollback if needed

---

## ✨ Sign-Off Checklist

Before marking as LIVE:

- [ ] All items above completed
- [ ] Security audit passed
- [ ] Performance testing passed
- [ ] User acceptance testing passed
- [ ] Admin testing passed
- [ ] Backup & recovery tested
- [ ] Monitoring configured
- [ ] Documentation complete
- [ ] Team trained
- [ ] Go/No-Go meeting held

---

## 📞 Support Contacts

### During Launch
- **CTO/Tech Lead**: [Contact]
- **DevOps Engineer**: [Contact]
- **Support Lead**: [Contact]
- **Emergency Line**: [Contact]

### Service Status Pages
- Korapay: korapay.com/status
- MongoDB: mongodbstatus.com
- Render: renderstatus.com
- Vercel: vercelstatus.com

---

## 🎉 Launch Day Timeline

### T-1 (Day Before)
- [ ] Final full test
- [ ] Brief team
- [ ] Prepare communication
- [ ] Verify rollback procedure

### T-0 (Launch Morning)
- [ ] 08:00 - Final checks
- [ ] 09:00 - Deploy backend
- [ ] 09:15 - Deploy frontend
- [ ] 09:30 - DNS propagation check
- [ ] 10:00 - Full system test
- [ ] 10:30 - Announce go-live
- [ ] 11:00 - Monitor closely

### T+1 (First Hour)
- [ ] Monitor error logs
- [ ] Check all payments work
- [ ] Verify users registering
- [ ] Monitor performance

### T+6 (First 6 Hours)
- [ ] Check transaction volume
- [ ] Review payment webhooks
- [ ] Monitor system health
- [ ] Gather initial feedback

### T+24 (First Day)
- [ ] Full system health check
- [ ] Review all metrics
- [ ] Document any issues
- [ ] Plan improvements

---

**Prepared By**: Development Team  
**Approval Status**: ⏳ Pending Final Review  
**Launch Date**: [Set Before Going Live]  
**Live Status**: ✅ READY

---

Once all items are checked, you're ready to go live! 🚀

**Last Updated**: January 18, 2026
