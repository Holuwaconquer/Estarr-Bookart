/**
 * Email Notification Service
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '') + '/api';

export const emailAPI = {
  // Send order confirmation
  sendOrderConfirmation: async (orderId) => {
    return fetch(`${API_BASE_URL}/emails/order-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ orderId })
    }).then(res => res.json());
  },

  // Send order status update
  sendOrderStatusUpdate: async (orderId, status) => {
    return fetch(`${API_BASE_URL}/emails/order-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ orderId, status })
    }).then(res => res.json());
  },

  // Send password reset email
  sendPasswordReset: async (email) => {
    return fetch(`${API_BASE_URL}/emails/password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    }).then(res => res.json());
  },

  // Send welcome email
  sendWelcomeEmail: async (userId) => {
    return fetch(`${API_BASE_URL}/emails/welcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ userId })
    }).then(res => res.json());
  },

  // Send shipping notification
  sendShippingNotification: async (orderId, trackingNumber) => {
    return fetch(`${API_BASE_URL}/emails/shipping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ orderId, trackingNumber })
    }).then(res => res.json());
  },

  // Subscribe to newsletter
  subscribeNewsletter: async (email) => {
    return fetch(`${API_BASE_URL}/emails/newsletter-subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    }).then(res => res.json());
  }
};

// Email templates
export const emailTemplates = {
  orderConfirmation: (order) => ({
    subject: `Order Confirmation - #${order._id}`,
    body: `
      <h2>Order Confirmation</h2>
      <p>Thank you for your purchase!</p>
      <p>Order ID: ${order._id}</p>
      <p>Total: ₦${order.totalAmount}</p>
      <p>Items: ${order.items.length}</p>
      <a href="${window.location.origin}/orders/${order._id}">View Order</a>
    `
  }),

  orderStatus: (order, status) => ({
    subject: `Order Status Update - ${status}`,
    body: `
      <h2>Order Status Update</h2>
      <p>Your order #${order._id} is now <strong>${status}</strong></p>
      <p>Track your order: <a href="${window.location.origin}/orders/${order._id}">View Details</a></p>
    `
  }),

  passwordReset: (resetLink) => ({
    subject: 'Reset Your Password',
    body: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
    `
  })
};
