# Environment Setup Guide

## Frontend Environment Variables

Create `.env` file in `book-store/` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# Payment Gateways
VITE_KORAPAY_PUBLIC_KEY=pk_live_xxxxx
VITE_KORAPAY_SECRET_KEY=sk_live_xxxxx

VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
VITE_PAYSTACK_SECRET_KEY=sk_live_xxxxx

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset

# Email Service (for frontend logging)
VITE_EMAIL_SERVICE=sendgrid
VITE_SENDGRID_API_KEY=SG_xxxxx

# Analytics
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# App Configuration
VITE_APP_NAME=BookStore
VITE_APP_DESCRIPTION=Your Online BookStore
```

## Backend Environment Variables

Create `.env` file in `Backend/` directory:

```env
# Node Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookstore

# JWT
JWT_SECRET=your_long_random_secret_key_min_32_chars
JWT_EXPIRE=7d

# Payment Gateways
KORAPAY_SECRET_KEY=sk_live_xxxxx
KORAPAY_PUBLIC_KEY=pk_live_xxxxx

PAYSTACK_SECRET_KEY=sk_live_xxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxx

# Email Service
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG_xxxxx
SENDER_EMAIL=noreply@bookstore.com

# Cloudinary
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx

# Frontend URL (for CORS & redirects)
FRONTEND_URL=http://localhost:5173
FRONTEND_URL_PROD=https://bookstore.com

# Webhooks
KORAPAY_WEBHOOK_SECRET=whsec_xxxxx
PAYSTACK_WEBHOOK_SECRET=whsec_xxxxx

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Security
CORS_ORIGIN=http://localhost:5173,https://bookstore.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Admin
ADMIN_EMAIL=admin@bookstore.com
ADMIN_PHONE=+234-1-234-5678
```

## Payment Gateway Setup

### Korapay Integration

1. **Sign up at** https://korapay.com
2. **Get API Keys:**
   - Public Key: In dashboard → Settings → API Keys
   - Secret Key: Keep this secret

3. **Configure Webhook:**
   - Webhook URL: `https://yourapi.com/webhooks/korapay`
   - Events: Select `charge.success`, `charge.failed`
   - Save webhook secret

4. **Test Mode:**
   ```
   Public Key: pk_test_xxxxx
   Secret Key: sk_test_xxxxx
   Test Card: 4532 1234 5678 9010
   ```

### Paystack Integration

1. **Sign up at** https://paystack.com
2. **Get API Keys:**
   - Public Key: In dashboard → Settings → API Keys & Webhooks
   - Secret Key: Keep this secret

3. **Configure Webhook:**
   - Webhook URL: `https://yourapi.com/webhooks/paystack`
   - Events: Select charge.success
   - Save webhook secret

4. **Test Mode:**
   ```
   Public Key: pk_test_xxxxx
   Secret Key: sk_test_xxxxx
   Test Card: 4084 0343 1657 9010
   ```

## Email Service Setup

### SendGrid

1. **Sign up at** https://sendgrid.com
2. **Create API Key:**
   - Go to Settings → API Keys
   - Create new API Key with Email Send access
   - Copy the API Key

3. **Verify Sender Domain:**
   - Go to Settings → Sender Authentication
   - Add your domain
   - Follow DNS verification steps

4. **Email Templates:**
   - Create templates in SendGrid dashboard
   - Use template IDs in backend code

### Alternative: Mailgun

```env
EMAIL_SERVICE=mailgun
MAILGUN_API_KEY=key-xxxxx
MAILGUN_DOMAIN=mail.bookstore.com
```

### Alternative: AWS SES

```env
EMAIL_SERVICE=aws-ses
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_SES_REGION=us-east-1
```

## Cloudinary Setup

1. **Sign up at** https://cloudinary.com
2. **Get Credentials:**
   - Cloud Name: In dashboard (top of screen)
   - API Key: In Settings → API Keys
   - API Secret: In Settings → API Keys (keep secret)

3. **Configure Upload Preset:**
   - Go to Settings → Upload
   - Create unsigned upload preset (for client-side uploads)
   - Enable: Auto-tagging, Auto-optimize
   - Set width/height restrictions

4. **Transformations:**
   ```
   // Automatic optimization
   https://res.cloudinary.com/{cloud_name}/image/upload/c_fill,w_400,q_auto,f_auto/{public_id}
   ```

## Database Setup

### MongoDB Atlas

1. **Create Account** at https://www.mongodb.com/cloud/atlas
2. **Create Cluster:**
   - Choose Shared (Free) tier
   - Select region closest to you
   - Wait for cluster creation (5-10 mins)

3. **Create Database User:**
   - Go to Security → Database Access
   - Add new database user
   - Save username and password

4. **Get Connection String:**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with database user password

### Local MongoDB

```bash
# Install MongoDB Community Edition
# https://docs.mongodb.com/manual/installation/

# Start MongoDB
mongod

# In another terminal, create database
mongo
use bookstore
```

## Deployment Setup

### Vercel (Frontend)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_API_URL
vercel env add VITE_KORAPAY_PUBLIC_KEY
# ... add all .env variables
```

### Render/Railway (Backend)

1. **Connect GitHub repository**
2. **Create service**
3. **Set environment variables in dashboard**
4. **Deploy**

### Docker Deployment

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Security Checklist

- [ ] All secrets are in `.env` (never in git)
- [ ] `.env` file is in `.gitignore`
- [ ] HTTPS is enabled in production
- [ ] CORS is properly configured
- [ ] Passwords are hashed (bcrypt)
- [ ] JWT tokens have expiration
- [ ] Rate limiting is enabled
- [ ] SQL/NoSQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented

## Verification Commands

```bash
# Frontend
npm run build  # Should complete without errors
npm run preview  # Preview production build

# Backend
node -e "require('dotenv').config(); console.log('ENV loaded')"

# Database
mongo --eval "db.version()"  # Check MongoDB connection

# Payment APIs
curl -H "Authorization: Bearer sk_live_xxxxx" https://api.korapay.com/merchant/api/v1/
```

## Troubleshooting

**Payment endpoints returning 401:**
- Check API keys in .env
- Verify keys are for correct environment (test vs production)
- Ensure Authorization header is sent

**Emails not sending:**
- Verify SendGrid API key is valid
- Check sender domain is verified
- Ensure "From" email matches verified sender

**Database connection failed:**
- Verify MONGODB_URI includes username:password
- Check IP whitelist in MongoDB Atlas
- Verify database name is correct

**CORS errors:**
- Add frontend URL to CORS_ORIGIN in backend .env
- Verify credentials: true in axios/fetch requests

