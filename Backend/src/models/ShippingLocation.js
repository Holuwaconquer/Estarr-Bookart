const mongoose = require('mongoose');

const shippingLocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  region: {
    type: String,
    required: [true, 'Region is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  shippingFee: {
    type: Number,
    required: [true, 'Shipping fee is required'],
    min: [0, 'Shipping fee cannot be negative'],
    default: 0
  },
  isFreeShipping: {
    type: Boolean,
    default: false
  },
  estimatedDeliveryDays: {
    type: Number,
    min: [1, 'Delivery days must be at least 1'],
    max: [30, 'Delivery days cannot exceed 30'],
    default: 3
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
shippingLocationSchema.index({ region: 1, state: 1 });
shippingLocationSchema.index({ isActive: 1 });
shippingLocationSchema.index({ sortOrder: 1 });

module.exports = mongoose.model('ShippingLocation', shippingLocationSchema);