const Payment = require('../models/Payment');
const Order = require('../models/Order');
const BankAccount = require('../models/BankAccount');
const ApiResponse = require('../utils/apiResponse');
const korapayService = require('../services/korapay.service');
const fs = require('fs').promises;
const path = require('path');

// @desc    Initialize Korapay payment
// @route   POST /api/payments/korapay/initialize
// @access  Private
exports.initializeKorapayPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const userId = req.userId;

    // Validate order exists
    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order) {
      return ApiResponse.error(res, 'Order not found', 404);
    }

    // Check authorization
    if (order.user._id.toString() !== userId) {
      return ApiResponse.error(res, 'Not authorized', 403);
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({
      order: orderId,
      status: { $in: ['pending', 'processing'] }
    });

    if (existingPayment) {
      return ApiResponse.error(res, 'Payment already in progress for this order', 400);
    }

    // Initialize Korapay payment
    const paymentInit = await korapayService.initializePayment({
      orderId,
      amount: order.total,
      currency: 'NGN',
      customerEmail: order.user.email,
      customerName: order.user.name,
      customerPhone: order.user.phone || '',
      description: `Order ${order.orderNumber}`
    });

    if (!paymentInit.success) {
      return ApiResponse.error(res, paymentInit.error || 'Failed to initialize payment', 500);
    }

    // Create payment record
    const payment = await Payment.create({
      order: orderId,
      user: userId,
      paymentMethod: 'korapay',
      amount: order.total,
      currency: 'NGN',
      status: 'pending',
      reference: paymentInit.data.reference,
      metadata: {
        orderNumber: order.orderNumber
      }
    });

    return ApiResponse.success(res, 'Payment initialized', {
      payment: payment._id,
      checkout_url: paymentInit.data.checkout_url,
      reference: paymentInit.data.reference
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Korapay payment
// @route   POST /api/payments/korapay/verify
// @access  Private
exports.verifyKorapayPayment = async (req, res, next) => {
  try {
    const { reference } = req.body;
    const userId = req.userId;

    if (!reference) {
      return ApiResponse.error(res, 'Reference is required', 400);
    }

    // Verify with Korapay
    const verification = await korapayService.verifyPayment(reference);

    if (!verification.success) {
      return ApiResponse.error(res, verification.error || 'Payment verification failed', 400);
    }

    // Find payment record
    const payment = await Payment.findOne({ reference }).populate('order', 'user total');

    if (!payment) {
      return ApiResponse.error(res, 'Payment record not found', 404);
    }

    // Verify user authorization
    if (payment.user.toString() !== userId) {
      return ApiResponse.error(res, 'Not authorized', 403);
    }

    // Update payment status
    payment.status = 'completed';
    payment.transactionId = verification.data.reference;
    await payment.save();

    // Update order payment status
    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentStatus = 'completed';
      order.paymentId = reference;
      order.status = 'processing';
      await order.save();
    }

    return ApiResponse.success(res, 'Payment verified successfully', {
      payment: payment,
      order: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bank accounts for manual transfer
// @route   GET /api/payments/bank-accounts
// @access  Public
exports.getBankAccounts = async (req, res, next) => {
  try {
    const accounts = await BankAccount.find({ isActive: true });

    if (!accounts.length) {
      return ApiResponse.error(res, 'No bank accounts available', 404);
    }

    return ApiResponse.success(res, 'Bank accounts retrieved', accounts);
  } catch (error) {
    next(error);
  }
};

// @desc    Create manual bank transfer payment
// @route   POST /api/payments/manual-transfer/create
// @access  Private
exports.createManualTransferPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const userId = req.userId;

    // Validate order
    const order = await Order.findById(orderId);
    if (!order) {
      return ApiResponse.error(res, 'Order not found', 404);
    }

    // Check authorization
    if (order.user.toString() !== userId) {
      return ApiResponse.error(res, 'Not authorized', 403);
    }

    // Get primary bank account
    const bankAccount = await BankAccount.findOne({ isActive: true });
    if (!bankAccount) {
      return ApiResponse.error(res, 'Bank account not configured', 500);
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({
      order: orderId,
      status: { $in: ['pending', 'processing', 'completed'] }
    });

    if (existingPayment) {
      return ApiResponse.error(res, 'Payment already exists for this order', 400);
    }

    // Create payment record
    const payment = await Payment.create({
      order: orderId,
      user: userId,
      paymentMethod: 'manual-bank-transfer',
      amount: order.total,
      currency: 'NGN',
      status: 'pending',
      accountDetails: {
        accountName: bankAccount.accountName,
        accountNumber: bankAccount.accountNumber,
        bankName: bankAccount.bankName,
        bankCode: bankAccount.bankCode
      }
    });

    // Update order payment status
    order.paymentStatus = 'pending';
    order.paymentMethod = 'manual-bank-transfer';
    await order.save();

    return ApiResponse.success(res, 'Manual transfer initiated', {
      payment: payment._id,
      bankAccount: {
        accountName: bankAccount.accountName,
        accountNumber: bankAccount.accountNumber,
        bankName: bankAccount.bankName
      },
      amount: order.total,
      reference: payment._id
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload proof of payment
// @route   POST /api/payments/:paymentId/upload-proof
// @access  Private
exports.uploadProofOfPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const userId = req.userId;

    if (!req.file) {
      return ApiResponse.error(res, 'No file uploaded', 400);
    }

    // Validate file type (only images and PDF)
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedMimes.includes(req.file.mimetype)) {
      // Clean up uploaded file
      await fs.unlink(req.file.path).catch(() => {});
      return ApiResponse.error(res, 'Only images and PDF files are allowed', 400);
    }

    // Validate file size (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      await fs.unlink(req.file.path).catch(() => {});
      return ApiResponse.error(res, 'File size exceeds 5MB limit', 400);
    }

    // Find payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      await fs.unlink(req.file.path).catch(() => {});
      return ApiResponse.error(res, 'Payment not found', 404);
    }

    // Check authorization
    if (payment.user.toString() !== userId) {
      await fs.unlink(req.file.path).catch(() => {});
      return ApiResponse.error(res, 'Not authorized', 403);
    }

    // Delete old proof if exists
    if (payment.proofOfPayment?.url) {
      try {
        const oldPath = path.join(process.cwd(), 'public', 'uploads', payment.proofOfPayment.filename);
        await fs.unlink(oldPath).catch(() => {});
      } catch (e) {
        // Ignore error
      }
    }

    // Save file info
    payment.proofOfPayment = {
      filename: req.file.filename,
      url: `/uploads/payments/${req.file.filename}`,
      uploadedAt: new Date()
    };
    payment.status = 'processing';

    await payment.save();

    return ApiResponse.success(res, 'Proof of payment uploaded successfully', {
      payment: payment,
      url: payment.proofOfPayment.url
    });
  } catch (error) {
    // Clean up file on error
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

// @desc    Get payment details
// @route   GET /api/payments/:paymentId
// @access  Private
exports.getPaymentDetails = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const userId = req.userId;

    const payment = await Payment.findById(paymentId).populate('order');

    if (!payment) {
      return ApiResponse.error(res, 'Payment not found', 404);
    }

    // Check authorization (user or admin)
    if (payment.user.toString() !== userId && req.userRole !== 'admin') {
      return ApiResponse.error(res, 'Not authorized', 403);
    }

    return ApiResponse.success(res, 'Payment retrieved', payment);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's payments
// @route   GET /api/payments/my-payments
// @access  Private
exports.getMyPayments = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: userId };
    if (status) query.status = status;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .populate('order', 'orderNumber total status'),
      Payment.countDocuments(query)
    ]);

    return ApiResponse.success(res, 'Payments retrieved', {
      payments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin endpoints

// @desc    Get all payments (Admin)
// @route   GET /api/admin/payments
// @access  Private/Admin
exports.getAllPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, paymentMethod } = req.query;

    const query = {};
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .populate('user', 'name email')
        .populate('order', 'orderNumber total'),
      Payment.countDocuments(query)
    ]);

    return ApiResponse.success(res, 'Payments retrieved', {
      payments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify/Approve manual payment (Admin)
// @route   PUT /api/admin/payments/:paymentId/verify
// @access  Private/Admin
exports.verifyManualPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { approved } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return ApiResponse.error(res, 'Payment not found', 404);
    }

    if (approved) {
      payment.status = 'completed';
      payment.proofOfPayment.verifiedAt = new Date();

      // Update order
      const order = await Order.findById(payment.order);
      if (order) {
        order.paymentStatus = 'completed';
        order.status = 'processing';
        await order.save();
      }
    } else {
      payment.status = 'failed';
      payment.proofOfPayment.rejectionReason = req.body.reason || 'Payment rejected by admin';
    }

    await payment.save();

    return ApiResponse.success(res, 'Payment updated', payment);
  } catch (error) {
    next(error);
  }
};

// @desc    Manage bank accounts (Admin)
// @route   POST /api/admin/bank-accounts
// @access  Private/Admin
exports.addBankAccount = async (req, res, next) => {
  try {
    const { accountName, accountNumber, bankName, bankCode, isPrimary } = req.body;

    // Validate required fields
    if (!accountName || !accountNumber || !bankName) {
      return ApiResponse.error(res, 'Missing required fields', 400);
    }

    const account = await BankAccount.create({
      accountName,
      accountNumber,
      bankName,
      bankCode,
      isPrimary: isPrimary || false
    });

    return ApiResponse.success(res, 'Bank account added', account, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bank accounts (Admin)
// @route   GET /api/admin/bank-accounts
// @access  Private/Admin
exports.getAllBankAccounts = async (req, res, next) => {
  try {
    const accounts = await BankAccount.find().sort('-createdAt');

    return ApiResponse.success(res, 'Bank accounts retrieved', accounts);
  } catch (error) {
    next(error);
  }
};

// @desc    Update bank account (Admin)
// @route   PUT /api/admin/bank-accounts/:accountId
// @access  Private/Admin
exports.updateBankAccount = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const { accountName, accountNumber, bankName, bankCode, isActive, isPrimary } = req.body;

    const account = await BankAccount.findByIdAndUpdate(
      accountId,
      {
        accountName,
        accountNumber,
        bankName,
        bankCode,
        isActive,
        isPrimary
      },
      { new: true, runValidators: true }
    );

    if (!account) {
      return ApiResponse.error(res, 'Bank account not found', 404);
    }

    return ApiResponse.success(res, 'Bank account updated', account);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete bank account (Admin)
// @route   DELETE /api/admin/bank-accounts/:accountId
// @access  Private/Admin
exports.deleteBankAccount = async (req, res, next) => {
  try {
    const { accountId } = req.params;

    const account = await BankAccount.findByIdAndDelete(accountId);

    if (!account) {
      return ApiResponse.error(res, 'Bank account not found', 404);
    }

    return ApiResponse.success(res, 'Bank account deleted');
  } catch (error) {
    next(error);
  }
};

// @desc    Korapay webhook handler
// @route   POST /api/payments/korapay-webhook
// @access  Public
exports.korapayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-korapay-signature'];
    const payload = req.body;

    // Verify signature
    if (!korapayService.verifyWebhookSignature(payload, signature)) {
      console.warn('Invalid Korapay webhook signature');
      return res.status(401).json({ success: false, error: 'Invalid signature' });
    }

    const { data, event } = payload;

    if (event === 'charge.success') {
      // Find and update payment
      const payment = await Payment.findOne({ reference: data.reference });

      if (payment) {
        payment.status = 'completed';
        payment.transactionId = data.reference;
        await payment.save();

        // Update order
        const order = await Order.findById(payment.order);
        if (order) {
          order.paymentStatus = 'completed';
          order.paymentId = data.reference;
          order.status = 'processing';
          await order.save();
        }
      }
    } else if (event === 'charge.failed') {
      const payment = await Payment.findOne({ reference: data.reference });
      if (payment) {
        payment.status = 'failed';
        await payment.save();
      }
    }

    // Always return 200 to acknowledge receipt
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Korapay webhook error:', error);
    // Still return 200 to prevent retries
    res.status(200).json({ success: true });
  }
};
