const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  uploadOrderProof
} = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth');

// Ensure uploads directory exists
const uploadDir = 'public/uploads/payments';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created uploads directory:', uploadDir);
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename and add timestamp
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${sanitized}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: JPG, PNG, GIF, PDF`), false);
    }
  }
});

// Error handler for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({ success: false, message: 'File size exceeds 5MB limit' });
    }
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

// Admin routes
router.get('/', protect, authorize('admin'), getAllOrders);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

// Protected user routes (more specific routes BEFORE generic :id routes)
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.post('/:id/upload-proof', protect, (req, res, next) => {
  upload.single('proof')(req, res, (err) => {
    handleMulterError(err, req, res, next);
  });
}, uploadOrderProof);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/payment-status', protect, updatePaymentStatus);
router.get('/:id', protect, getOrderById);

module.exports = router;