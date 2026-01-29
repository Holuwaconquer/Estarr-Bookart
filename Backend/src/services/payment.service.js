import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export class PaymentService {
  static async createPaymentIntent(order) {
    try {
      // Calculate total
      const total = order.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);

      // Create customer if doesn't exist
      let customer;
      if (order.user.stripeCustomerId) {
        customer = await stripe.customers.retrieve(order.user.stripeCustomerId);
      } else {
        customer = await stripe.customers.create({
          email: order.user.email,
          name: order.user.name,
          metadata: {
            userId: order.user._id.toString()
          }
        });
        
        // Save stripeCustomerId to user
        await User.findByIdAndUpdate(order.user._id, {
          stripeCustomerId: customer.id
        });
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // Convert to cents
        currency: 'usd',
        customer: customer.id,
        metadata: {
          orderId: order._id.toString(),
          userId: order.user._id.toString()
        },
        description: `Order #${order.orderNumber}`,
        shipping: order.shippingAddress ? {
          name: order.shippingAddress.fullName,
          address: {
            line1: order.shippingAddress.address,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            postal_code: order.shippingAddress.zipCode,
            country: order.shippingAddress.country
          }
        } : undefined
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
      };
    } catch (error) {
      console.error('Payment intent creation error:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  static async handleWebhook(event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object);
        break;
      case 'charge.refunded':
        await this.handleRefund(event.data.object);
        break;
    }
  }
}