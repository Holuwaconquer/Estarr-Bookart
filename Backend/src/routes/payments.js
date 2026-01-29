const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/payments');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'proof-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Public routes
router.post('/korapay-webhook', paymentController.korapayWebhook);
router.get('/bank-accounts', paymentController.getBankAccounts);

// Protected routes
router.post(
  '/korapay/initialize',
  protect,
  paymentController.initializeKorapayPayment
);

router.post(
  '/korapay/verify',
  protect,
  paymentController.verifyKorapayPayment
);

router.post(
  '/manual-transfer/create',
  protect,
  paymentController.createManualTransferPayment
);

router.post(
  '/:paymentId/upload-proof',
  protect,
  upload.single('proof'),
  paymentController.uploadProofOfPayment
);

router.get(
  '/:paymentId',
  protect,
  paymentController.getPaymentDetails
);

router.get(
  '/my-payments',
  protect,
  paymentController.getMyPayments
);

// Admin routes
router.get(
  '/admin/payments',
  protect,
  authorize('admin'),
  paymentController.getAllPayments
);

router.put(
  '/admin/payments/:paymentId/verify',
  protect,
  authorize('admin'),
  paymentController.verifyManualPayment
);

router.post(
  '/admin/bank-accounts',
  protect,
  authorize('admin'),
  paymentController.addBankAccount
);

router.get(
  '/admin/bank-accounts',
  protect,
  authorize('admin'),
  paymentController.getAllBankAccounts
);

router.put(
  '/admin/bank-accounts/:accountId',
  protect,
  authorize('admin'),
  paymentController.updateBankAccount
);

router.delete(
  '/admin/bank-accounts/:accountId',
  protect,
  authorize('admin'),
  paymentController.deleteBankAccount
);

module.exports = router;
