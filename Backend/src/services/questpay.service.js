const axios = require('axios');

class QuestPayService {
  constructor() {
    this.baseURL = (
      process.env.QUESTPAY_BASE_URL || 'https://payments-api.questlabs.cc/api'
    ).replace(/\/+$/, '');
    this.apiKey = process.env.QUESTPAY_API_KEY;
  }

  getHeaders() {
    if (!this.apiKey) {
      throw new Error('QUESTPAY_API_KEY is not configured');
    }

    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async initializeCheckout({
    reference,
    email,
    amount,
    description,
    metadata,
    returnUrl,
  }) {
    const response = await axios.post(
      `${this.baseURL}/v2/checkout/initialize`,
      {
        reference,
        email,
        amount,
        description,
        metadata,
        return_url: returnUrl,
      },
      { headers: this.getHeaders(), timeout: 15000 },
    );

    if (!response.data?.success || !response.data?.data?.checkout_url) {
      throw new Error(
        response.data?.message || 'QuestPay did not return a checkout URL',
      );
    }

    return response.data.data;
  }

  async verifyCheckout(reference) {
    const response = await axios.get(
      `${this.baseURL}/v2/checkout/verify/${encodeURIComponent(reference)}`,
      { headers: this.getHeaders(), timeout: 15000 },
    );

    if (!response.data?.success || !response.data?.data) {
      throw new Error(response.data?.message || 'QuestPay verification failed');
    }

    return response.data.data;
  }
}

module.exports = new QuestPayService();
