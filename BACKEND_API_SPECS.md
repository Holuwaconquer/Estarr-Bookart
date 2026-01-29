/**
 * BACKEND API ENDPOINTS - Required Implementation
 * 
 * This file documents all backend endpoints that need to be created
 * for the advanced features to work
 */

// ============================================
// PAYMENT ENDPOINTS (Korapay & Paystack)
// ============================================

/**
 * POST /api/payments/korapay/initialize
 * Initialize Korapay payment for an order
 */
const korapayInitialize = {
  request: {
    body: {
      orderId: String,
      amount: Number, // in kobo (₦1 = 100 kobo)
      email: String,
      metadata: {
        orderId: String,
        userId: String
      }
    }
  },
  response: {
    reference: String,
    checkout_url: String,
    amount: Number
  }
};

/**
 * GET /api/payments/korapay/verify/:reference
 * Verify Korapay payment status
 */
const korapayVerify = {
  params: { reference: String },
  response: {
    success: Boolean,
    data: {
      reference: String,
      amount: Number,
      status: String, // 'success', 'failed', 'pending'
      orderId: String
    }
  }
};

/**
 * POST /api/payments/paystack/initialize
 * Initialize Paystack payment for an order
 */
const paystackInitialize = {
  request: {
    body: {
      orderId: String,
      amount: Number, // in kobo
      email: String
    }
  },
  response: {
    reference: String,
    access_code: String,
    authorization_url: String,
    amount: Number
  }
};

/**
 * GET /api/payments/paystack/verify/:reference
 * Verify Paystack payment status
 */
const paystackVerify = {
  params: { reference: String },
  response: {
    success: Boolean,
    data: {
      reference: String,
      amount: Number,
      status: String,
      orderId: String
    }
  }
};

// ============================================
// EMAIL ENDPOINTS
// ============================================

/**
 * POST /api/emails/order-confirmation
 * Send order confirmation email
 */
const orderConfirmationEmail = {
  request: {
    body: { orderId: String },
    headers: { Authorization: 'Bearer token' }
  },
  response: {
    success: Boolean,
    message: String
  }
};

/**
 * POST /api/emails/order-status
 * Send order status update email
 */
const orderStatusEmail = {
  request: {
    body: {
      orderId: String,
      status: String // 'confirmed', 'shipped', 'delivered'
    },
    headers: { Authorization: 'Bearer token' }
  },
  response: {
    success: Boolean,
    message: String
  }
};

/**
 * POST /api/emails/password-reset
 * Send password reset email
 */
const passwordResetEmail = {
  request: {
    body: { email: String }
  },
  response: {
    success: Boolean,
    message: String
  }
};

/**
 * POST /api/emails/welcome
 * Send welcome email to new user
 */
const welcomeEmail = {
  request: {
    body: { userId: String },
    headers: { Authorization: 'Bearer token' }
  },
  response: {
    success: Boolean,
    message: String
  }
};

/**
 * POST /api/emails/newsletter-subscribe
 * Subscribe email to newsletter
 */
const newsletterSubscribe = {
  request: {
    body: { email: String }
  },
  response: {
    success: Boolean,
    message: String,
    subscriptionId: String
  }
};

// ============================================
// ORDER ENDPOINTS
// ============================================

/**
 * GET /api/orders/user
 * Get all orders for authenticated user
 */
const getUserOrders = {
  headers: { Authorization: 'Bearer token' },
  response: {
    orders: [
      {
        _id: String,
        userId: String,
        items: Array,
        totalAmount: Number,
        status: String,
        shippingInfo: Object,
        createdAt: Date,
        confirmedAt: Date,
        shippedAt: Date,
        deliveredAt: Date
      }
    ]
  }
};

/**
 * GET /api/orders/:orderId
 * Get single order details
 */
const getOrderById = {
  params: { orderId: String },
  headers: { Authorization: 'Bearer token' },
  response: {
    order: {
      _id: String,
      userId: String,
      items: Array,
      totalAmount: Number,
      status: String,
      shippingInfo: Object,
      trackingNumber: String,
      createdAt: Date
    }
  }
};

/**
 * POST /api/orders/:orderId/cancel
 * Cancel an order
 */
const cancelOrder = {
  params: { orderId: String },
  headers: { Authorization: 'Bearer token' },
  response: {
    success: Boolean,
    message: String
  }
};

// ============================================
// ANALYTICS ENDPOINTS
// ============================================

/**
 * GET /api/admin/analytics?period=month
 * Get analytics data for admin dashboard
 */
const getAnalytics = {
  query: { period: String }, // 'day', 'week', 'month', 'year'
  headers: { Authorization: 'Bearer admin_token' },
  response: {
    totalRevenue: Number,
    totalOrders: Number,
    totalCustomers: Number,
    totalViews: Number,
    revenueGrowth: Number,
    orderGrowth: Number,
    monthlyRevenue: [
      { month: String, revenue: Number, orders: Number }
    ],
    categoryRevenue: [
      { name: String, value: Number, percentage: Number }
    ],
    topProducts: [
      { id: String, title: String, sales: Number, revenue: Number }
    ],
    recentOrders: [
      { id: String, customer: String, amount: Number, status: String, date: Date }
    ]
  }
};

// ============================================
// AUTH ENDPOINTS
// ============================================

/**
 * POST /api/auth/register
 * Register new user
 */
const registerUser = {
  request: {
    body: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      password: String
    }
  },
  response: {
    success: Boolean,
    user: {
      _id: String,
      firstName: String,
      lastName: String,
      email: String,
      phone: String
    },
    token: String
  }
};

/**
 * POST /api/auth/login
 * User login
 */
const loginUser = {
  request: {
    body: {
      email: String,
      password: String
    }
  },
  response: {
    success: Boolean,
    user: {
      _id: String,
      firstName: String,
      lastName: String,
      email: String
    },
    token: String
  }
};

/**
 * GET /api/auth/profile
 * Get authenticated user profile
 */
const getUserProfile = {
  headers: { Authorization: 'Bearer token' },
  response: {
    user: {
      _id: String,
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      avatar: String,
      createdAt: Date
    }
  }
};

/**
 * POST /api/auth/password-reset-request
 * Request password reset
 */
const requestPasswordReset = {
  request: {
    body: { email: String }
  },
  response: {
    success: Boolean,
    message: String
  }
};

/**
 * POST /api/auth/password-reset
 * Reset password with token
 */
const resetPassword = {
  request: {
    body: {
      token: String,
      password: String
    }
  },
  response: {
    success: Boolean,
    message: String
  }
};

// ============================================
// WEBHOOK ENDPOINTS
// ============================================

/**
 * POST /webhooks/korapay
 * Korapay payment webhook
 */
const korapayWebhook = {
  request: {
    body: {
      event: String,
      data: {
        reference: String,
        status: String,
        amount: Number,
        metadata: Object
      }
    }
  },
  response: {
    success: Boolean
  }
};

/**
 * POST /webhooks/paystack
 * Paystack payment webhook
 */
const paystackWebhook = {
  request: {
    body: {
      event: String,
      data: {
        reference: String,
        status: String,
        amount: Number,
        customer: Object
      }
    }
  },
  response: {
    success: Boolean
  }
};

// ============================================
// EXAMPLE BACKEND IMPLEMENTATION (Node.js/Express)
// ============================================

/*
// Payment Routes
app.post('/api/payments/korapay/initialize', async (req, res) => {
  try {
    const { orderId, amount, email } = req.body;
    
    // Create payment record
    const payment = await Payment.create({
      orderId,
      amount,
      email,
      provider: 'korapay',
      status: 'pending'
    });
    
    // Call Korapay API
    const korapayRes = await fetch('https://api.korapay.com/merchant/api/v1/charges/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.KORAPAY_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reference: payment._id,
        amount: amount,
        currency: 'NGN',
        customer: { email },
        notification_url: `${process.env.BACKEND_URL}/webhooks/korapay`
      })
    });
    
    const result = await korapayRes.json();
    
    res.json({
      reference: payment._id,
      checkout_url: result.data.checkout_url
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook handler
app.post('/webhooks/korapay', async (req, res) => {
  try {
    const { data } = req.body;
    const { reference, status } = data;
    
    // Verify payment
    if (status === 'success') {
      const order = await Order.findByIdAndUpdate(
        reference,
        { status: 'paid', paidAt: new Date() },
        { new: true }
      );
      
      // Send confirmation email
      await sendOrderConfirmationEmail(order);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/

module.exports = {
  korapayInitialize,
  korapayVerify,
  paystackInitialize,
  paystackVerify,
  orderConfirmationEmail,
  orderStatusEmail,
  passwordResetEmail,
  welcomeEmail,
  newsletterSubscribe,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAnalytics,
  registerUser,
  loginUser,
  getUserProfile,
  requestPasswordReset,
  resetPassword,
  korapayWebhook,
  paystackWebhook
};
