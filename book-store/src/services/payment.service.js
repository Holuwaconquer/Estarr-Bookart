/**
 * Payment Service - Korapay & Paystack Integration
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '') + '/api';

export const paymentAPI = {
  // QuestPay hosted bank-transfer checkout
  initializeQuestpayPayment: async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/payments/questpay/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `******'token')}`
      },
      body: JSON.stringify({ orderId })
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to initialize QuestPay checkout');
    }

    return result;
  },

  verifyQuestpayPayment: async (reference) => {
    const response = await fetch(
      `${API_BASE_URL}/payments/questpay/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `******'token')}`
        }
      }
    );
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to verify QuestPay payment');
    }

    return result;
  },

  // Korapay Payment
  initiateKorapayPayment: async (orderData) => {
    return fetch(`${API_BASE_URL}/payments/korapay/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(orderData)
    }).then(res => res.json());
  },

  verifyKorapayPayment: async (reference) => {
    return fetch(`${API_BASE_URL}/payments/korapay/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).then(res => res.json());
  },

  // Paystack Payment
  initiatePaystackPayment: async (orderData) => {
    return fetch(`${API_BASE_URL}/payments/paystack/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(orderData)
    }).then(res => res.json());
  },

  verifyPaystackPayment: async (reference) => {
    return fetch(`${API_BASE_URL}/payments/paystack/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).then(res => res.json());
  },

  // Get payment methods
  getPaymentMethods: async () => {
    return fetch(`${API_BASE_URL}/payments/methods`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).then(res => res.json());
  }
};

// Korapay SDK initialization
export const loadKorapayScript = () => {
  return new Promise((resolve) => {
    if (window.Korapay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.korapay.com/v1/korapay.min.js';
    script.async = true;
    script.onload = resolve;
    document.head.appendChild(script);
  });
};

// Paystack SDK initialization
export const loadPaystackScript = () => {
  return new Promise((resolve) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = resolve;
    document.head.appendChild(script);
  });
};

// Korapay checkout handler
export const openKorapayCheckout = (config) => {
  return new Promise((resolve, reject) => {
    loadKorapayScript().then(() => {
      if (!window.Korapay) {
        reject(new Error('Korapay failed to load'));
        return;
      }

      window.Korapay.checkout({
        ...config,
        onClose: () => reject(new Error('Payment cancelled')),
        onSuccess: (response) => resolve(response),
        onFailed: (error) => reject(error)
      });
    });
  });
};

// Paystack checkout handler
export const openPaystackCheckout = (config) => {
  return new Promise((resolve, reject) => {
    loadPaystackScript().then(() => {
      if (!window.PaystackPop) {
        reject(new Error('Paystack failed to load'));
        return;
      }

      const handler = window.PaystackPop.setup({
        ...config,
        onClose: () => reject(new Error('Payment cancelled')),
        callback: (response) => resolve(response)
      });
      handler.openIframe();
    });
  });
};
