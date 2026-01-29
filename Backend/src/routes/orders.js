const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder
} = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth');

// Protected user routes
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/payment-status', protect, updatePaymentStatus);

// Admin routes
router.get('/', protect, authorize('admin'), getAllOrders);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

module.exports = router;