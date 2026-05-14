const express = require('express');
const {
  getShippingLocations,
  getAllShippingLocations,
  getShippingLocation,
  createShippingLocation,
  updateShippingLocation,
  deleteShippingLocation
} = require('../controllers/shippingLocation.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getShippingLocations);

// Admin routes
router.get('/admin', protect, authorize('admin'), getAllShippingLocations);
router.post('/', protect, authorize('admin'), createShippingLocation);
router.get('/:id', getShippingLocation);
router.put('/:id', protect, authorize('admin'), updateShippingLocation);
router.delete('/:id', protect, authorize('admin'), deleteShippingLocation);

module.exports = router;