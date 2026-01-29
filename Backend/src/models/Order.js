const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  items: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    title: String,
    author: String,
    image: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    edition: String
  }],
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'bank-transfer', 'korapay', 'manual'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: String,
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingFee: {
    type: Number,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'received', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: String,
  notes: String,
  adminNotes: String,
  cancellationReason: String,
  refundRequested: {
    type: Boolean,
    default: false
  },
  refundApproved: {
    type: Boolean,
    default: false
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
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

// Generate order number before validation so it's available for required checks
orderSchema.pre('validate', async function(next) {
  if (!this.isNew) return next();

  try {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');

    // Start and end of today (local time)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const count = await mongoose.model('Order').countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    this.orderNumber = `ORD${year}${month}${day}${sequence}`;
    try {
      console.log('Generating orderNumber for new order:', this.orderNumber);
    } catch (e) {}
    next();
  } catch (error) {
    next(error);
  }
});

// Update updatedAt on save
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'user': 1, 'createdAt': -1 });

module.exports = mongoose.model('Order', orderSchema);