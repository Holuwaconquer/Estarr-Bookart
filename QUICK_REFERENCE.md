# 🚀 Estarr BookStore - Quick Reference Guide

## 📌 Important Files & Locations

### Configuration
- Backend config: `Backend/.env.example` → Copy to `Backend/.env`
- Frontend config: `book-store/.env.example` → Copy to `book-store/.env`

### Payment System
- **Korapay Service**: `Backend/src/services/korapay.service.js`
- **Payment Controller**: `Backend/src/controllers/payment.controller.js`
- **Payment Routes**: `Backend/src/routes/payments.js`
- **Payment Models**: `Backend/src/models/Payment.js`, `BankAccount.js`

### Frontend
- **Checkout Page**: `book-store/src/Pages/Checkout.jsx`
- **Cart Page**: `book-store/src/Pages/Cart.jsx`
- **Admin Payments**: `book-store/src/Pages/Admin/adminComponent/PaymentManagement.jsx`
- **API Service**: `book-store/src/services/api.js`

### Documentation
- **Deployment Guide**: `PRODUCTION_DEPLOYMENT.md`
- **Security Guide**: `SECURITY_CHECKLIST.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`
- **README**: `README.md`

---

## 🔑 API Key Configuration

### Korapay Setup
```env
# Get from https://korapay.com/dashboard
KORAPAY_PUBLIC_KEY=pk_live_xxxxx
KORAPAY_SECRET_KEY=sk_live_xxxxx
```

### MongoDB Setup
```env
# Create at https://www.mongodb.com/cloud/atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookstore
```

### JWT Configuration
```env
# Generate secure random string
JWT_SECRET=your_super_secure_random_string_here_at_least_32_chars
JWT_EXPIRE=7d
```

### Email Configuration
```env
# Gmail App-specific password (not your regular password)
EMAIL_ADDRESS_TO_SEND_CODE=your_email@gmail.com
PASSWORD_TO_EMAIL_ADDRESS_TO_SEND_CODE=xxxx xxxx xxxx xxxx
```

---

## 🎯 Payment Flow

### Korapay Payment
```
1. User selects "Card Payment (Korapay)"
2. System creates order
3. /api/payments/korapay/initialize called
4. Redirect to Korapay checkout
5. User completes payment
6. Webhook notifies backend
7. Order marked as "processing"
8. User sees confirmation
```

### Manual Bank Transfer
```
1. User selects "Manual Bank Transfer"
2. System creates order with payment status "pending"
3. Show bank account details
4. User transfers money
5. User uploads proof of payment
6. Payment status changes to "processing"
7. Admin reviews proof
8. Admin approves/rejects
9. Order moves to "processing" or "failed"
10. User gets email notification
```

---

## 👨‍💼 Admin Workflow

### Initial Setup
1. Go to `/admin/login` (default: admin/admin - CHANGE THIS!)
2. Navigate to Payment Management
3. Click "Add Account"
4. Fill in bank details
5. Save

### Daily Tasks
1. Check for pending payments
2. Review proof of payment files
3. Approve/reject manual payments
4. Monitor Korapay payments
5. Check order status

### Payment Verification
1. Click "View" on pending payment
2. Review proof image/PDF
3. Click "Approve" or "Reject"
4. If rejecting, enter reason
5. System notifies user

---

## 🏥 Common Issues & Fixes

### Korapay Not Working
```bash
✗ Check: API keys are correct
✗ Check: Webhook URL is accessible
✗ Check: Internet connection working
✗ Check: Korapay server status
✗ Solution: Use sandbox keys first to test
```

### Email Not Sending
```bash
✗ Check: Gmail app-specific password (not regular password)
✗ Check: "Less secure apps" setting if needed
✗ Check: Email address is correct
✗ Solution: Test with debug mode
```

### Payment Proof Not Uploading
```bash
✗ Check: File size < 5MB
✗ Check: File type is JPG, PNG, GIF, or PDF
✗ Check: /public/uploads/payments folder exists
✗ Solution: Create folder: mkdir -p public/uploads/payments
```

### Orders Not Creating
```bash
✗ Check: User is authenticated
✗ Check: Cart has items
✗ Check: Shipping address is filled
✗ Check: User logged in
✗ Solution: Check browser console for errors
```

---

## 📊 Database Queries

### View Recent Payments
```javascript
db.payments.find().sort({ createdAt: -1 }).limit(10)
```

### View Pending Approvals
```javascript
db.payments.find({ status: "processing", paymentMethod: "manual-bank-transfer" })
```

### Check Orders by Status
```javascript
db.orders.find({ status: "processing" }).count()
```

### User Orders
```javascript
db.orders.find({ user: ObjectId("user_id") }).sort({ createdAt: -1 })
```

---

## 🔐 Security Reminders

### DO's ✅
- ✅ Use strong JWT_SECRET (32+ characters)
- ✅ Use strong admin password
- ✅ Rotate API keys monthly
- ✅ Monitor logs regularly
- ✅ Keep dependencies updated
- ✅ Use HTTPS in production
- ✅ Backup database daily

### DON'Ts ❌
- ❌ Don't commit .env to git
- ❌ Don't share API keys
- ❌ Don't use weak passwords
- ❌ Don't test on production data
- ❌ Don't disable rate limiting
- ❌ Don't expose error details
- ❌ Don't store card data

---

## 📱 Responsive Design Testing

### Breakpoints
```
Mobile:  < 640px
Tablet:  640px - 1024px
Desktop: > 1024px
```

### Test These
- [x] Navbar collapses on mobile
- [x] Cart sidebar becomes full-width
- [x] Checkout form is readable
- [x] Buttons are touch-friendly (48px)
- [x] Images scale properly
- [x] Text is readable
- [x] No horizontal scroll

---

## 🚀 Deployment Servers

### Free Options
- **Render.com** - Backend hosting (free tier)
- **Vercel.com** - Frontend hosting (free)
- **MongoDB Atlas** - Database (free tier)

### Paid Options (Recommended)
- **DigitalOcean** - $6/month VPS
- **AWS** - Pay as you go
- **Heroku** - $7+/month (backend)
- **Netlify** - Free/paid frontend

---

## 📞 Support Contacts

### Documentation
- Deployment: `PRODUCTION_DEPLOYMENT.md`
- Security: `SECURITY_CHECKLIST.md`
- Implementation: `IMPLEMENTATION_SUMMARY.md`

### Payment Providers
- Korapay Support: support@korapay.com
- MongoDB Support: https://support.mongodb.com

### Development
- Check error logs: `Backend/` or browser console
- Enable debug mode in `.env`
- Review API responses in Postman

---

## ⏱️ Estimated Times

### Setup
- Backend setup: 15 minutes
- Frontend setup: 10 minutes
- Database setup: 5 minutes
- Environment configuration: 10 minutes
- **Total**: ~40 minutes

### Testing
- Payment flow: 20 minutes
- Manual transfer: 15 minutes
- Admin approval: 10 minutes
- Responsive design: 10 minutes
- **Total**: ~55 minutes

### Deployment
- Backend deployment: 10 minutes
- Frontend deployment: 10 minutes
- Domain setup: 20 minutes
- SSL/TLS: 10 minutes
- Testing: 30 minutes
- **Total**: ~80 minutes

---

## 🎓 Learning Paths

### For Developers
1. Read `README.md` - Understand project
2. Read `IMPLEMENTATION_SUMMARY.md` - See what's done
3. Check `Backend/src/` - Study code
4. Check `book-store/src/` - Study components
5. Read API documentation

### For Admins
1. Read admin setup section
2. Learn payment verification process
3. Monitor logs regularly
4. Backup database daily
5. Update security regularly

### For Users
1. Register account
2. Browse books
3. Add to cart
4. Checkout
5. Choose payment method
6. Complete transaction

---

## 🔔 Monitoring Checklist

### Daily
- [ ] Check error logs
- [ ] Verify payments processed
- [ ] Check user registrations
- [ ] Monitor server uptime

### Weekly
- [ ] Review payment reports
- [ ] Check database size
- [ ] Audit access logs
- [ ] Test backup restore

### Monthly
- [ ] Security update check
- [ ] Performance review
- [ ] User feedback analysis
- [ ] Feature request review

### Quarterly
- [ ] Full security audit
- [ ] Disaster recovery test
- [ ] Architecture review
- [ ] Compliance check

---

## 🎉 Success Indicators

When you see these, you're ready for production:

✅ All payments working in sandbox
✅ Admin can verify payments
✅ Emails sending successfully
✅ Mobile design looks good
✅ No errors in console
✅ Database backups working
✅ Security headers present
✅ Rate limiting working
✅ All tests passing
✅ Documentation complete

---

## 📝 Troubleshooting Template

When something breaks:

```
1. What happened?
   - Description of issue
   
2. When did it happen?
   - Exact time/date
   
3. What was I doing?
   - Step-by-step actions
   
4. What's the error?
   - Check console/logs
   - Copy full error message
   
5. What have I tried?
   - List attempts
   
6. What's different?
   - Recent changes
   - Environment updates
```

Then:
1. Check error logs
2. Review recent changes
3. Test in development
4. Check documentation
5. Review similar issues
6. Ask for help with details

---

## 🎯 Quick Links

### Local Development
- Backend: http://localhost:5000
- Frontend: http://localhost:5173
- Health Check: http://localhost:5000/health

### Admin Panel
- URL: http://localhost:5173/admin/login
- Default: admin / admin (CHANGE THIS!)
- Payments: /admin/dashboard (Payment Management tab)

### API Endpoints
- Base: http://localhost:5000/api
- Books: /books
- Orders: /orders
- Payments: /payments
- Auth: /auth

### Documentation
- Start Here: README.md
- Setup: PRODUCTION_DEPLOYMENT.md
- Security: SECURITY_CHECKLIST.md
- Status: IMPLEMENTATION_SUMMARY.md

---

## ✨ Pro Tips

1. **Save Korapay Sandbox Keys** - Keep them safe for testing
2. **Document Bank Details** - Keep admin notes updated
3. **Monitor Webhook Delivery** - Check logs for failed webhooks
4. **Regular Backups** - Don't skip database backups
5. **Log Reviews** - Check logs weekly for issues
6. **Test Everything** - Always test before going live
7. **Keep Docs Updated** - Update docs with changes
8. **Gradual Rollout** - Test with small users first

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅

For detailed information, see the main documentation files.
