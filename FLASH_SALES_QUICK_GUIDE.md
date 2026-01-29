# Quick Reference: Flash Sales & Promo Bar

## What Was Done

### ✅ Created PromoBar Component
- **File:** `book-store/src/components/PromoBar.jsx`
- **Purpose:** Sticky promotional banner above navbar
- **Features:** Auto-rotating messages, closeable, smooth animations
- **Usage:** Already integrated in `Home.jsx`

### ✅ Created FlashDeals Component
- **File:** `book-store/src/components/FlashDeals.jsx`
- **Purpose:** Dynamic flash deals section on landing page
- **Features:** Fetches real data from backend, countdown timer, product cards
- **Usage:** Integrated in `Landingpage.jsx`

### ✅ Added Backend Endpoint
- **Route:** `GET /api/books/flash/deals?limit=4`
- **Location:** `Backend/src/controllers/book.controller.js` + `routes/books.js`
- **Returns:** Books sorted by highest discount

### ✅ Updated Home Layout
- **File:** `book-store/src/Pages/Home.jsx`
- **Change:** PromoBar now renders before Navbar

### ✅ Updated Landing Page
- **File:** `book-store/src/Pages/Landingpage.jsx`
- **Changes:** 
  - Removed old static promo announcement
  - Removed old static deals data
  - Integrated dynamic FlashDeals component

---

## Key Features

| Feature | Where | How |
|---------|-------|-----|
| 🎯 Promo Banner | Top of page (PromoBar) | Rotates 4 messages, sticky, closeable |
| 📢 Auto Rotation | Every 4 seconds | Change in `PromoBar.jsx` line ~25 |
| ⏱️ Countdown Timer | FlashDeals section | Real-time, updates every second |
| 💰 Dynamic Pricing | From backend | Shows original + discounted price |
| 🖼️ Product Images | From Book model | Displays with hover effects |
| 📱 Responsive | Both components | Mobile-first design |
| 🔗 Product Links | Card click | Routes to `/product/{id}` |

---

## API Endpoints

### Flash Deals
```
GET /api/books/flash/deals?limit=4
Response: Array of books with highest discounts
```

---

## Customization Quick Wins

### 1. Change Promo Messages (PromoBar.jsx)
```javascript
const promos = [
  "Your message 1",
  "Your message 2",
  // Add more...
];
```

### 2. Change Message Rotation Speed (PromoBar.jsx)
```javascript
}, 4000);  // milliseconds (4000 = 4 seconds)
```

### 3. Change Flash Deals Count (FlashDeals.jsx)
```javascript
const response = await fetch('...?limit=4');
// Change 4 to 8, 12, or any number
```

### 4. Change Discount Sorting (Backend - book.controller.js)
```javascript
.sort('-discount')  // Highest discount first (current)
.sort('-rating')    // By rating instead
.sort('-price')     // By price highest first
```

---

## File Structure

```
book-store/
├── src/
│   ├── components/
│   │   ├── PromoBar.jsx           ← NEW
│   │   ├── FlashDeals.jsx         ← NEW
│   │   └── Navbar.jsx             (unchanged)
│   └── Pages/
│       ├── Home.jsx               ← UPDATED (added PromoBar)
│       └── Landingpage.jsx        ← UPDATED (uses FlashDeals)

Backend/
├── src/
│   ├── controllers/
│   │   └── book.controller.js     ← UPDATED (added getFlashDeals)
│   └── routes/
│       └── books.js               ← UPDATED (added /flash/deals route)
```

---

## Testing Checklist

- [ ] Backend running on port 5000
- [ ] PromoBar shows on home page
- [ ] PromoBar messages rotate every 4 seconds
- [ ] PromoBar can be closed (✕ button works)
- [ ] FlashDeals section loads on landing page
- [ ] Countdown timer updates in real-time
- [ ] Flash deals cards show product images
- [ ] Clicking a deal card navigates to product page
- [ ] Prices display correctly (original + discount)
- [ ] Mobile view is responsive
- [ ] No console errors

---

## Data Requirements

Your Book model needs these fields (already has them):
- ✅ `_id` - Product ID
- ✅ `title` - Product name
- ✅ `image` - Product image URL
- ✅ `price` - Current price
- ✅ `originalPrice` - Original price (optional)
- ✅ `discount` - Discount percentage (0-100)
- ✅ `author` - Author name

---

## Environment Variables

Make sure backend is accessible:
```
Backend URL: http://localhost:5000
API Base: /api
```

If your backend is on a different URL, update in `FlashDeals.jsx`:
```javascript
const response = await fetch('YOUR_BACKEND_URL/api/books/flash/deals?limit=4');
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Flash deals not loading | Check backend running, verify URL in FlashDeals.jsx |
| PromoBar not showing | Check Home.jsx has `<PromoBar />`, clear cache |
| Timer not counting down | Check browser console, verify setInterval not cleared |
| Images not loading | Verify image URLs in Book model |
| Links not working | Ensure React Router is configured, check product IDs |

---

## Making It More Dynamic

### To allow admins to control flash deals:

1. Add field to Book model:
```javascript
isFlashDeal: { type: Boolean, default: false }
```

2. Update backend endpoint:
```javascript
const books = await Book.find({ isFlashDeal: true })
```

3. Add toggle in Admin Dashboard to set `isFlashDeal` flag

---

## Performance Notes

- Timer updates once per second (efficient)
- Fetches data on component mount only
- Fallback to sample data if API unavailable
- Images use React's built-in optimization

---

## Need Help?

Check the full guide: `FLASH_SALES_IMPLEMENTATION.md`

---

**Status:** ✅ Ready to Use  
**Last Updated:** January 2026
