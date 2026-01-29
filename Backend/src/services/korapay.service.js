const axios = require('axios');

class KorapayService {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production'
      ? 'https://api.korapay.com/merchant/api/v1'
      : 'https://api-sandbox.korapay.com/merchant/api/v1';
    this.publicKey = process.env.KORAPAY_PUBLIC_KEY;
    this.secretKey = process.env.KORAPAY_SECRET_KEY;
  }

  /**
   * Initialize a payment
   */
  async initializePayment(paymentData) {
    try {
      const {
        orderId,
        amount,
        currency = 'NGN',
        customerEmail,
        customerName,
        customerPhone,
        description,
        metadata = {}
      } = paymentData;

      const payload = {
        reference: `ORDER_${orderId}_${Date.now()}`,
        amount: Math.round(amount * 100), // Convert to kobo
        currency,
        notification_url: `${process.env.BACKEND_URL}/api/payments/korapay-webhook`,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone
        },
        description: description || 'Book Store Order',
        metadata: {
          orderId,
          ...metadata
        }
      };

      const response = await axios.post(
        `${this.baseURL}/charges/initialize`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        return {
          success: true,
          data: {
            reference: response.data.data.reference,
            checkout_url: response.data.data.checkout_url,
            amount: amount,
            currency
          }
        };
      }

      throw new Error(response.data.message || 'Failed to initialize payment');
    } catch (error) {
      console.error('Korapay initialization error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Verify payment
   */
  async verifyPayment(reference) {
    try {
      const response = await axios.get(
        `${this.baseURL}/charges/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const charge = response.data.data;

      if (charge.status === 'success') {
        return {
          success: true,
          data: {
            reference: charge.reference,
            amount: charge.amount / 100, // Convert from kobo
            status: charge.status,
            metadata: charge.metadata,
            payment_method: charge.payment_method,
            paid_at: charge.paid_at
          }
        };
      }

      return {
        success: false,
        status: charge.status,
        error: 'Payment not completed'
      };
    } catch (error) {
      console.error('Korapay verification error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Handle webhook from Korapay
   */
  verifyWebhookSignature(payload, signature) {
    try {
      const crypto = require('crypto');
      const hash = crypto
        .createHmac('sha256', this.secretKey)
        .update(JSON.stringify(payload))
        .digest('hex');

      return hash === signature;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Get payment status
   */
  getPaymentStatus(chargeStatus) {
    const statusMap = {
      'success': 'completed',
      'pending': 'pending',
      'failed': 'failed',
      'processing': 'processing'
    };

    return statusMap[chargeStatus] || 'unknown';
  }
}

module.exports = new KorapayService();
