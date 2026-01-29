const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['korapay', 'manual-bank-transfer'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  reference: String, // For Korapay reference
  transactionId: String,

  // Manual payment fields
  proofOfPayment: {
    filename: String,
    url: String,
    uploadedAt: Date,
    verifiedAt: Date,
    rejectionReason: String
  },
  accountDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    bankCode: String
  },

  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ reference: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

// Update timestamp on save
paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
