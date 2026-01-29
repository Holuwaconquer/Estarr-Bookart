const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
  accountName: {
    type: String,
    required: [true, 'Account name is required'],
    trim: true
  },
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    trim: true
  },
  bankName: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true
  },
  bankCode: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  notes: String,
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

// Ensure only one primary account
bankAccountSchema.pre('save', async function(next) {
  if (this.isPrimary) {
    await mongoose.model('BankAccount').updateMany(
      { _id: { $ne: this._id } },
      { isPrimary: false }
    );
  }
  this.updatedAt = Date.now();
  next();
});

// Index
bankAccountSchema.index({ isActive: 1, isPrimary: 1 });

module.exports = mongoose.model('BankAccount', bankAccountSchema);
