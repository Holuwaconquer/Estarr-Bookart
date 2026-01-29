# 🚀 StoreApp - Deployment Guide

## Pre-Deployment Checklist

Before deploying, ensure you have:
- [ ] All code committed to Git
- [ ] Environment variables prepared (.env files)
- [ ] MongoDB Atlas account & connection string
- [ ] Korapay API keys (production)
- [ ] OAuth credentials (Google, Facebook)
- [ ] Email service credentials (if using)
- [ ] Cloudinary account for image storage
- [ ] Render or Railway account for backend
- [ ] Vercel or Netlify account for frontend

---

## Backend Deployment (Render)

### Step 1: Prepare Backend

1. Navigate to Backend folder:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Verify render.yaml exists with correct configuration:
```yaml
services:
  - type: web
    name: storeapp-api
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        value: your_mongodb_connection_string
      - key: JWT_SECRET
        value: your_jwt_secret
      - key: KORAPAY_PUBLIC_KEY
        value: your_korapay_public_key
      - key: KORAPAY_SECRET_KEY
        value: your_korapay_secret_key
```

### Step 2: Deploy to Render

1. Go to [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the Backend folder
5. Configure:
   - **Name**: storeapp-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better uptime)

6. Add environment variables:
   - `NODE_ENV`: production
   - `MONGODB_URI`: your_connection_string
   - `JWT_SECRET`: random_secret_key
   - `KORAPAY_PUBLIC_KEY`: your_key
   - `KORAPAY_SECRET_KEY`: your_secret
   - `CLOUDINARY_NAME`: your_cloudinary_name
   - `CLOUDINARY_API_KEY`: your_api_key
   - `CLOUDINARY_API_SECRET`: your_secret

7. Click "Create Web Service"
8. Wait for deployment (5-10 minutes)
9. Note the backend URL: `https://storeapp-api.onrender.com`

### Step 3: Verify Backend

Test endpoints:
```bash
curl https://storeapp-api.onrender.com/api/books
curl https://storeapp-api.onrender.com/api/categories
```

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. Navigate to frontend folder:
```bash
cd book-store
```

2. Update API base URL in `src/services/api.js`:
```javascript
const API_BASE_URL = 'https://storeapp-api.onrender.com/api';
```

3. Build locally to verify:
```bash
npm run build
```

4. Verify no build errors:
```bash
npm run preview
```

### Step 2: Deploy to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add environment variables:
   - `VITE_API_BASE_URL`: `https://storeapp-api.onrender.com/api`
   - `VITE_GOOGLE_CLIENT_ID`: your_google_client_id
   - `VITE_FACEBOOK_APP_ID`: your_facebook_app_id

6. Click "Deploy"
7. Wait for deployment (2-5 minutes)
8. Note the frontend URL: `https://storeapp.vercel.app`

### Step 3: Update Backend CORS

1. In Backend `server.js`, update CORS:
```javascript
app.use(cors({
  origin: ['https://storeapp.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

2. Commit and redeploy backend

---

## Post-Deployment Configuration

### Step 1: Update Frontend URLs

Update all hardcoded localhost URLs:
- Remove all `http://localhost:3000` references
- Update OAuth redirect URIs
- Verify all API calls use environment variables

### Step 2: Configure Custom Domain (Optional)

**For Vercel**:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records

**For Backend (Render)**:
1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS records

### Step 3: Enable HTTPS

- Vercel: Automatic (free SSL)
- Render: Automatic (free SSL)

### Step 4: Configure Payment Gateway

1. **Korapay**:
   - Update webhook URL in Korapay dashboard
   - Ensure production API keys are used
   - Test payment flow

2. **Bank Transfer**:
   - Verify bank details are correct
   - Set up email notifications

### Step 5: Set Up Monitoring

1. **Error Tracking** (Sentry):
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production"
});
```

2. **Analytics** (Google Analytics):
```javascript
import gtag from 'ga-gtag';

gtag('config', 'GA_MEASUREMENT_ID');
```

---

## Verification Checklist

### Backend Tests
- [ ] API responds to requests
- [ ] Database connection works
- [ ] All endpoints return correct data
- [ ] Authentication tokens valid
- [ ] Payment endpoints functional
- [ ] Error handling works

### Frontend Tests
- [ ] Landing page loads
- [ ] Shop page displays books
- [ ] Search/filter works
- [ ] Product details load
- [ ] Cart functions properly
- [ ] Checkout flow complete
- [ ] Login/register works
- [ ] Admin pages accessible
- [ ] All animations smooth
- [ ] Images load correctly
- [ ] No console errors
- [ ] Performance acceptable

### Security Verification
- [ ] HTTPS enabled
- [ ] API keys not exposed
- [ ] Passwords hashed
- [ ] JWT tokens working
- [ ] CORS properly configured
- [ ] Rate limiting active

---

## Common Issues & Solutions

### Issue: 504 Service Unavailable
**Solution**: Increase backend sleep timeout on Render
```yaml
services:
  - type: web
    name: storeapp-api
    sleepTimeoutSecs: 3600
```

### Issue: CORS Errors
**Solution**: Update backend CORS configuration with production URL

### Issue: Images Not Loading
**Solution**: Verify Cloudinary credentials and URLs in production

### Issue: Payment Integration Not Working
**Solution**: 
- Verify production API keys
- Update webhook URLs
- Check merchant account status

### Issue: Database Connection Timeout
**Solution**:
- Verify MongoDB Atlas IP whitelist
- Check connection string format
- Ensure firewall allows connections

---

## Monitoring & Maintenance

### Daily
- [ ] Check error logs
- [ ] Monitor uptime
- [ ] Review payment transactions

### Weekly
- [ ] Analyze user behavior
- [ ] Check performance metrics
- [ ] Review security logs

### Monthly
- [ ] Database backup
- [ ] Performance optimization
- [ ] Security updates
- [ ] User feedback review

---

## Rollback Procedure

If deployment causes issues:

**For Vercel**:
1. Go to Deployments
2. Click on previous working deployment
3. Click "Promote to Production"

**For Render**:
1. Go to Deployment History
2. Click on previous working deployment
3. Click "Redeploy"

---

## Performance Optimization (Production)

### Frontend
```javascript
// Enable production builds
npm run build

// Analyze bundle
npm run build -- --analyze

// Optimize images
- Use WebP format
- Compress with TinyPNG/ImageOptim
- Implement lazy loading
```

### Backend
```javascript
// Enable compression
app.use(compression());

// Implement caching
const redis = require('redis');
const client = redis.createClient();

// Database indexing
db.collection('books').createIndex({ title: 1 });
db.collection('orders').createIndex({ userId: 1 });
```

---

## Support & Troubleshooting

**Common Commands**:
```bash
# Backend logs
vercel logs --follow

# Frontend logs
vercel logs --project storeapp --follow

# Database connection test
node -e "require('./Backend/src/config/database.js')"

# API health check
curl -i https://storeapp-api.onrender.com/api/health
```

---

## Post-Launch

1. **Announce Launch**: Share links on social media
2. **Monitor**: Watch for issues in first 24-48 hours
3. **Gather Feedback**: Collect user feedback
4. **Fix Bugs**: Address any critical issues immediately
5. **Plan v2**: Start planning features based on feedback

---

## Success Indicators

✅ Backend responding to all requests
✅ Frontend loading without errors
✅ Shopping flow complete
✅ Payments processing
✅ Admin features working
✅ Users can register & login
✅ Performance acceptable
✅ Security measures active

---

## Emergency Contacts

- **Render Support**: support@render.com
- **Vercel Support**: support@vercel.com
- **MongoDB Support**: support@mongodb.com
- **Korapay Support**: support@korapay.com

---

**Deployment Date**: ________
**Backend URL**: ________
**Frontend URL**: ________
**Status**: ________

---

*Congratulations on launching StoreApp! 🎉*
