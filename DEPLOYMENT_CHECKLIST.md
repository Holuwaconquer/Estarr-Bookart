# Deployment Checklist - Flash Sales & Promo Bar

## Pre-Deployment Verification

### Backend Setup
- [ ] Backend server is running on `http://localhost:5000`
- [ ] MongoDB connection is active
- [ ] Book model has `discount` field
- [ ] At least 4 books exist with `discount > 0`
- [ ] `book.controller.js` has `getFlashDeals` function
- [ ] `books.js` has `/flash/deals` route
- [ ] API endpoint returns valid JSON
- [ ] No console errors in backend

**Test API Endpoint:**
```bash
curl http://localhost:5000/api/books/flash/deals?limit=4
```

Expected response: Array of books with discount data

---

### Frontend Setup
- [ ] `PromoBar.jsx` exists in `components/` folder
- [ ] `FlashDeals.jsx` exists in `components/` folder
- [ ] `Home.jsx` imports and uses `<PromoBar />`
- [ ] `Landingpage.jsx` imports and uses `<FlashDeals />`
- [ ] Old static promo bar removed from Landingpage
- [ ] Old static deals array removed from Landingpage
- [ ] Backend URL is correct in FlashDeals.jsx
- [ ] All imports are present and correct

**Verify Imports:**
```javascript
// Home.jsx
import PromoBar from '../components/PromoBar'

// Landingpage.jsx
import FlashDeals from '../components/FlashDeals'
```

---

### Dependencies
- [ ] `framer-motion` package installed (for animations)
- [ ] `react-hot-toast` package installed (for notifications)
- [ ] `react-icons` package installed (HiFire, HiClock)
- [ ] All packages in `package.json`

**Check Installation:**
```bash
cd book-store
npm list framer-motion react-hot-toast react-icons
```

---

### Browser Testing

#### Desktop (Chrome/Firefox/Edge)
- [ ] PromoBar appears at top of page
- [ ] PromoBar is above navbar
- [ ] PromoBar messages rotate every 4 seconds
- [ ] PromoBar ✕ button works
- [ ] Flash deals section appears on landing page
- [ ] Flash deals load successfully
- [ ] Deal cards display images
- [ ] Countdown timer counts down
- [ ] Prices display correctly (original + discount)
- [ ] Discount badges show percentage
- [ ] Clicking deal navigates to product page
- [ ] No console errors

#### Mobile (iOS Safari/Chrome)
- [ ] PromoBar responsive and readable
- [ ] Flash deals grid stacks properly (2 columns on mobile)
- [ ] Images display correctly on small screens
- [ ] Timer displays without wrapping
- [ ] Deal cards are tappable
- [ ] Touch interactions work smoothly

#### Tablet (iPad/Android)
- [ ] PromoBar looks good
- [ ] Flash deals show 2-4 columns based on screen
- [ ] All text is readable
- [ ] Images scale properly

---

### Functionality Testing

#### PromoBar Functionality
- [ ] First promo message displays: "Free shipping..."
- [ ] Message rotates every 4 seconds
- [ ] Message 2 displays: "Flash deals ending..."
- [ ] Message 3 displays: "Free gift..."
- [ ] Message 4 displays: "Pay on delivery..."
- [ ] Back to message 1 (cycle continues)
- [ ] Close button (✕) dismisses bar
- [ ] Dismissal persists during session
- [ ] Refresh shows it again
- [ ] Smooth fade animation on message change
- [ ] Smooth slide-down animation on load

#### FlashDeals Functionality
- [ ] Component loads on page mount
- [ ] API request is made to `/api/books/flash/deals`
- [ ] Data is fetched successfully
- [ ] 4 deals are displayed (or configured number)
- [ ] All deal cards show:
  - [ ] Product image
  - [ ] Product title
  - [ ] Discount percentage badge
  - [ ] Current price
  - [ ] Original price (strikethrough)
  - [ ] Countdown time
- [ ] Countdown timer:
  - [ ] Starts at 24:00:00
  - [ ] Decrements seconds every 1 second
  - [ ] Properly carries over minutes
  - [ ] Properly carries over hours
  - [ ] Resets to 24:00:00 when complete
- [ ] Deal card hover effect works
- [ ] Deal card click navigates to product
- [ ] Fallback data shows if API fails

---

### Error Handling
- [ ] Check browser console for errors
- [ ] Network tab shows successful API call
- [ ] No 404 errors
- [ ] No CORS errors
- [ ] No JavaScript syntax errors
- [ ] Backend handles missing data gracefully

---

### Performance Testing
- [ ] PromoBar renders in < 100ms
- [ ] FlashDeals API call completes in < 1s
- [ ] Timer updates don't cause lag
- [ ] Message rotation is smooth
- [ ] No memory leaks (intervals cleaned up)
- [ ] Page Load Time: < 3 seconds
- [ ] Largest Contentful Paint (LCP): < 2.5s
- [ ] First Input Delay (FID): < 100ms
- [ ] Cumulative Layout Shift (CLS): < 0.1

---

### Database Verification
- [ ] Connected to MongoDB
- [ ] Books collection exists
- [ ] At least 4 books have `discount > 0`
- [ ] Books have valid image URLs
- [ ] Books have correct pricing data
- [ ] Query `Book.find({ discount: { $gt: 0 } })` returns results

**Test in Mongo shell:**
```javascript
db.books.find({ discount: { $gt: 0 } }).sort({ discount: -1 }).limit(4)
```

---

## Production Deployment Steps

### Step 1: Environment Configuration
```bash
# Backend
cd Backend
# Verify .env has correct:
# - DATABASE_URL
# - PORT
# - NODE_ENV=production

# Frontend
cd ../book-store
# Verify .env has correct:
# - VITE_API_URL (or update in FlashDeals.jsx)
```

### Step 2: Build Frontend
```bash
cd book-store
npm run build
# Check for build errors
# Verify dist folder created
```

### Step 3: Run Tests
```bash
# Manual testing checklist above
# Automated tests (if available)
npm test
```

### Step 4: Backend Deployment
```bash
cd Backend
# Deploy to production server
# (e.g., Render, Heroku, DigitalOcean)
npm install --production
npm start
```

### Step 5: Frontend Deployment
```bash
cd book-store
# Deploy to production
# (e.g., Vercel, Netlify, AWS S3)
npm run build
# Upload dist folder
```

### Step 6: Production Verification
- [ ] Navigate to production URL
- [ ] PromoBar appears and rotates
- [ ] FlashDeals section loads
- [ ] API calls go to production backend
- [ ] No console errors
- [ ] All functionality works
- [ ] Mobile responsive

---

## Post-Deployment

### Monitoring
- [ ] Set up error logging (Sentry, LogRocket)
- [ ] Monitor API response times
- [ ] Monitor page load performance
- [ ] Track user interactions
- [ ] Monitor conversion rates from flash deals

### Maintenance
- [ ] Review analytics weekly
- [ ] Check flash deals are updating
- [ ] Verify countdown timer accuracy
- [ ] Monitor for any JavaScript errors
- [ ] Update promo messages as needed
- [ ] Adjust discount thresholds if needed

---

## Rollback Plan

If issues occur:

### Quick Rollback
1. Revert `Home.jsx` (remove PromoBar)
2. Revert `Landingpage.jsx` (remove FlashDeals)
3. Revert backend routes/controllers
4. Redeploy

### Database Rollback
- No database schema changes made
- Safe to revert without data loss

---

## Common Issues & Solutions

### Issue: Flash Deals Not Loading
**Solution:**
- Check backend is running
- Verify backend URL in FlashDeals.jsx
- Check database connection
- Ensure books with discounts exist

### Issue: PromoBar Not Showing
**Solution:**
- Clear browser cache
- Hard refresh (Ctrl+F5)
- Verify import in Home.jsx
- Check z-50 class applied

### Issue: API 404 Error
**Solution:**
- Verify route added to `books.js`
- Verify controller function exported
- Check route path: `/flash/deals`
- Restart backend server

### Issue: Images Not Loading
**Solution:**
- Verify image URLs in database
- Check CORS settings if external images
- Verify image field name matches

---

## Verification Checklist - Before Going Live

### Critical (Must Have)
- [ ] PromoBar displays on all pages
- [ ] FlashDeals loads real data from backend
- [ ] Countdown timer works in real-time
- [ ] No JavaScript console errors
- [ ] Backend API responds correctly
- [ ] Mobile responsive design works

### Important (Should Have)
- [ ] PromoBar dismissal works
- [ ] Flash deals click navigate properly
- [ ] Images load correctly
- [ ] Prices format with commas
- [ ] Animations are smooth
- [ ] No memory leaks

### Nice to Have (Would Be Nice)
- [ ] Analytics tracking
- [ ] Error logging
- [ ] Performance monitoring
- [ ] A/B testing ready

---

## Sign-Off

- [ ] Tested by Developer: _____________ Date: _______
- [ ] Tested by QA: _____________ Date: _______
- [ ] Approved by Product Owner: _____________ Date: _______
- [ ] Ready for Production: ✅ Date: _______

---

## Notes

```
Development Environment:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

Production Environment:
- Backend: [Your production URL]
- Frontend: [Your production URL]

Key Contacts:
- Backend Support: [Contact]
- Frontend Support: [Contact]
- DevOps: [Contact]
```

---

## Rollout Schedule

**Phase 1: Development** (Current)
- [ ] Features implemented and tested locally
- Date: January 22, 2026

**Phase 2: Staging** (Next)
- [ ] Deploy to staging environment
- [ ] Full testing
- [ ] Performance testing
- Target Date: [Your Date]

**Phase 3: Production** (Future)
- [ ] Deploy to production
- [ ] Monitor closely for 24 hours
- [ ] Collect user feedback
- Target Date: [Your Date]

---

**Prepared by:** Development Team  
**Date:** January 22, 2026  
**Status:** Ready for Deployment ✅
