const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Book = require('../models/Book');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const questpayService = require('../services/questpay.service');
const {
  sendOrderConfirmationEmail,
  sendOrderNotificationEmail,
} = require('../services/emailService');

const findQuestPayPayment = (reference) => {
  const escapedReference = String(reference).replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  );

  return Payment.findOne({
    reference: { $regex: `^${escapedReference}$`, $options: 'i' },
    paymentMethod: 'questpay',
  });
};

const cancelQuestPayOrder = async (orderId, reason) => {
  const session = await Order.startSession();
  let cancelledOrder = null;

  try {
    await session.withTransaction(async () => {
      cancelledOrder = await Order.findOneAndUpdate(
        {
          _id: orderId,
          status: 'pending',
          paymentStatus: { $ne: 'completed' },
        },
        {
          $set: {
            status: 'cancelled',
            paymentStatus: 'failed',
            cancellationReason: reason,
          },
        },
        { new: false, session },
      );

      if (!cancelledOrder) return;

      for (const item of cancelledOrder.items) {
        const stockUpdate = await Book.updateOne(
          { _id: item.book },
          { $inc: { stock: item.quantity } },
          { session },
        );
        if (stockUpdate.matchedCount !== 1) {
          throw new Error(`Book ${item.book} for cancelled order was not found`);
        }
      }
    });
  } finally {
    await session.endSession();
  }

  return cancelledOrder;
};

const assertPaymentIdentity = async (payment, details) => {
  const metadataUserId = details.metadata?.userId;
  if (metadataUserId) {
    if (String(metadataUserId) !== String(payment.user)) {
      throw new Error('QuestPay user metadata does not match this payment');
    }
    return;
  }

  const email = details.customer?.email || details.email;
  if (!email) {
    throw new Error('QuestPay payment has no user metadata or customer email');
  }

  const user = await User.findById(payment.user).select('email');
  if (!user || user.email.toLowerCase() !== String(email).toLowerCase()) {
    throw new Error('QuestPay customer email does not match this payment');
  }
};

const completeQuestPayPayment = async (payment, details) => {
  await assertPaymentIdentity(payment, details);

  const order = await Order.findById(payment.order);
  if (!order) throw new Error('Order for QuestPay payment was not found');
  if (String(order.user) !== String(payment.user)) {
    throw new Error('QuestPay payment user does not match the order owner');
  }

  const requestedAmount = Number(
    details.requested_amount ??
      details.transaction?.amount ??
      (details.checkout ? payment.amount : details.amount),
  );
  if (
    !Number.isFinite(requestedAmount) ||
    Math.abs(requestedAmount - payment.amount) > 0.01
  ) {
    throw new Error('QuestPay requested amount does not match the order total');
  }

  const incomingAmount = Number(
    details.payment?.amountPaid ??
      details.fees?.grossAmount ??
      details.amount,
  );
  const expectedIncomingAmount = Number(
    payment.metadata?.checkoutAmount ?? payment.amount,
  );
  if (
    !Number.isFinite(incomingAmount) ||
    Math.abs(incomingAmount - expectedIncomingAmount) > 0.01
  ) {
    throw new Error('QuestPay received amount does not match the checkout');
  }

  let newlyCompleted = false;
  if (payment.status !== 'completed') {
    const completedPayment = await Payment.findOneAndUpdate(
      { _id: payment._id, status: { $ne: 'completed' } },
      {
        $set: {
          status: 'completed',
          transactionId:
            details.payment?.providerTransactionId || details.reference,
          'metadata.paidAt': details.paid_at || details.paidAt || new Date(),
          'metadata.grossAmount': incomingAmount,
          'metadata.platformFee': Number(details.fees?.platformFee) || 0,
        },
      },
      { new: true },
    );
    if (completedPayment) {
      payment = completedPayment;
      newlyCompleted = true;
    } else {
      payment = await Payment.findById(payment._id);
      if (!payment) throw new Error('QuestPay payment record was not found');
    }
  }

  order.paymentStatus = 'completed';
  order.paymentId = payment.reference;
  if (order.status === 'cancelled') {
    order.adminNotes = [
      order.adminNotes,
      'QuestPay received payment after order cancellation; review for fulfillment or refund.',
    ]
      .filter(Boolean)
      .join('\n');
  } else {
    order.status = 'processing';
  }
  await order.save();
  await order.populate('shippingLocation');

  if (newlyCompleted) {
    const user = await User.findById(payment.user).select(
      'name email phonenumber',
    );
    if (!user) {
      console.error(
        'QuestPay payment confirmed, but the order email recipient was not found',
        { orderId: String(order._id), userId: String(payment.user) },
      );
    } else {
      const [customerEmailSent, adminEmailSent] = await Promise.all([
        sendOrderConfirmationEmail(order, user),
        sendOrderNotificationEmail(order, user),
      ]);
      if (!customerEmailSent) {
        console.error('Order confirmation email was not sent after payment', {
          orderId: String(order._id),
          userId: String(payment.user),
        });
      }
      if (!adminEmailSent) {
        console.error('Admin notification email was not sent after payment', {
          orderId: String(order._id),
          userId: String(payment.user),
        });
      }
    }
  }

  return { payment, order };
};

const failQuestPayPayment = async (payment, reason) => {
  if (payment.status !== 'completed') {
    payment.status = 'failed';
    await payment.save();
    await cancelQuestPayOrder(payment.order, reason);
  }
};

exports.initializeCheckout = async (req, res, next) => {
  let payment;
  let orderClaimed = false;

  try {
    const { orderId } = req.body;
    if (!orderId) {
      return ApiResponse.error(res, 'Order ID is required', 400);
    }

    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order) return ApiResponse.error(res, 'Order not found', 404);
    if (String(order.user._id) !== String(req.userId)) {
      return ApiResponse.error(res, 'Not authorized', 403);
    }
    if (order.paymentMethod !== 'questpay') {
      return ApiResponse.error(res, 'Order is not using QuestPay', 400);
    }
    if (order.paymentStatus === 'completed' || order.status !== 'pending') {
      return ApiResponse.error(res, 'Order is not awaiting payment', 409);
    }

    const existingPayment = await Payment.findOne({
      order: order._id,
      paymentMethod: 'questpay',
      status: { $in: ['pending', 'processing'] },
    });
    if (existingPayment?.metadata?.checkoutUrl) {
      return ApiResponse.success(res, 'QuestPay checkout already initialized', {
        payment: existingPayment._id,
        reference: existingPayment.reference,
        checkout_url: existingPayment.metadata.checkoutUrl,
        amount: existingPayment.metadata.checkoutAmount,
        requested_amount: existingPayment.amount,
        fee_payer: existingPayment.metadata.feePayer,
        collection_fee: existingPayment.metadata.collectionFee,
      });
    }
    if (existingPayment) {
      return ApiResponse.error(
        res,
        'A QuestPay checkout is already being initialized for this order',
        409,
      );
    }

    const claimedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        user: req.userId,
        paymentMethod: 'questpay',
        paymentStatus: 'pending',
        status: 'pending',
      },
      { $set: { paymentStatus: 'processing' } },
      { new: true },
    );
    if (!claimedOrder) {
      return ApiResponse.error(
        res,
        'Order is already being processed for payment',
        409,
      );
    }
    orderClaimed = true;

    const reference = `ESTARR-${order.orderNumber}-${crypto.randomUUID()}`.toUpperCase();
    payment = await Payment.create({
      order: order._id,
      user: req.userId,
      paymentMethod: 'questpay',
      amount: order.total,
      currency: 'NGN',
      status: 'pending',
      reference,
      metadata: { requestedAmount: order.total },
    });

    const frontendUrl =
      process.env.FRONTEND_URL ||
      process.env.PRODUCTION_URL ||
      'http://localhost:5173';
    const checkout = await questpayService.initializeCheckout({
      reference,
      email: order.user.email,
      amount: order.total,
      description: `EStarr Bookart order ${order.orderNumber}`,
      metadata: {
        userId: String(req.userId),
        orderId: String(order._id),
        orderNumber: order.orderNumber,
      },
      returnUrl: `${frontendUrl.replace(/\/+$/, '')}/checkout`,
    });

    const checkoutAmount = Number(checkout.amount);
    const requestedAmount = Number(checkout.requested_amount ?? order.total);
    if (
      !Number.isFinite(checkoutAmount) ||
      checkoutAmount <= 0 ||
      !Number.isFinite(requestedAmount) ||
      Math.abs(requestedAmount - order.total) > 0.01
    ) {
      throw new Error('QuestPay returned an invalid checkout amount');
    }

    payment.metadata = {
      ...payment.metadata,
      checkoutUrl: checkout.checkout_url,
      checkoutAmount,
      requestedAmount,
      feePayer: checkout.fee_payer,
      collectionFee: Number(checkout.collection_fee) || 0,
      expiresAt: checkout.expires_at,
      apiVersion: checkout.api_version,
    };
    await payment.save();

    return ApiResponse.success(res, 'QuestPay checkout initialized', {
      payment: payment._id,
      reference,
      checkout_url: checkout.checkout_url,
      amount: payment.metadata.checkoutAmount,
      requested_amount: payment.amount,
      fee_payer: payment.metadata.feePayer,
      collection_fee: payment.metadata.collectionFee,
    });
  } catch (error) {
    try {
      if (payment) {
        await failQuestPayPayment(
          payment,
          'QuestPay checkout initialization failed',
        );
      } else if (orderClaimed) {
        await cancelQuestPayOrder(
          req.body.orderId,
          'QuestPay checkout initialization failed',
        );
      }
    } catch (cleanupError) {
      console.error('QuestPay checkout cleanup failed:', cleanupError);
    }
    next(error);
  }
};

exports.verifyCheckout = async (req, res, next) => {
  try {
    const { reference } = req.params;
    const payment = await findQuestPayPayment(reference);
    if (!payment) return ApiResponse.error(res, 'Payment not found', 404);
    if (
      String(payment.user) !== String(req.userId) &&
      req.userRole !== 'admin'
    ) {
      return ApiResponse.error(res, 'Not authorized', 403);
    }

    if (payment.status === 'completed') {
      const order = await Order.findById(payment.order).populate(
        'shippingLocation',
      );
      if (!order) return ApiResponse.error(res, 'Order not found', 404);
      if (order.paymentStatus !== 'completed') {
        order.paymentStatus = 'completed';
        order.paymentId = payment.reference;
        if (order.status !== 'cancelled') order.status = 'processing';
        await order.save();
      }
      return ApiResponse.success(res, 'Payment verified successfully', {
        status: 'paid',
        payment,
        order,
      });
    }

    const details = await questpayService.verifyCheckout(payment.reference);
    if (
      String(details.reference).toLowerCase() !==
      payment.reference.toLowerCase()
    ) {
      return ApiResponse.error(res, 'QuestPay reference mismatch', 502);
    }

    if (details.status === 'paid') {
      const completed = await completeQuestPayPayment(payment, details);
      return ApiResponse.success(res, 'Payment verified successfully', {
        status: 'paid',
        ...completed,
      });
    }

    if (details.status === 'expired' || details.status === 'failed') {
      await failQuestPayPayment(
        payment,
        `QuestPay checkout ${details.status}`,
      );
    } else if (details.status !== 'pending') {
      return ApiResponse.error(res, 'Unexpected QuestPay payment status', 502);
    }

    return ApiResponse.success(res, 'QuestPay payment status retrieved', {
      status: details.status,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

exports.handleWebhook = async (req, res, next) => {
  try {
    const secret = process.env.QUESTPAY_API_KEY;
    if (!secret) {
      console.error('QuestPay webhook rejected: QUESTPAY_API_KEY is not configured');
      return res.status(500).send('Webhook verification is not configured');
    }

    if (!Buffer.isBuffer(req.body)) {
      return res.status(400).send('Raw webhook body is required');
    }

    const signature = req.get('x-questpay-signature') || '';
    if (!/^[a-f\d]{64}$/i.test(signature)) {
      console.error('QuestPay webhook rejected: malformed signature');
      return res.status(400).send('Invalid signature');
    }

    const calculated = crypto
      .createHmac('sha256', secret)
      .update(req.body)
      .digest('hex');
    const expected = Buffer.from(calculated, 'utf8');
    const received = Buffer.from(signature, 'utf8');
    if (
      expected.length !== received.length ||
      !crypto.timingSafeEqual(expected, received)
    ) {
      console.error('QuestPay webhook rejected: signature verification failed');
      return res.status(400).send('Invalid signature');
    }

    let payload;
    try {
      payload = JSON.parse(req.body.toString('utf8'));
    } catch (error) {
      console.error('QuestPay webhook rejected: malformed JSON', error.message);
      return res.status(400).send('Invalid JSON payload');
    }

    const headerEvent = req.get('x-questpay-event');
    if (
      !['payment.received', 'checkout.failed'].includes(headerEvent) ||
      payload.event !== headerEvent ||
      !payload.data ||
      typeof payload.data.reference !== 'string'
    ) {
      console.error('QuestPay webhook rejected: unexpected event or payload');
      return res.status(400).send('Unexpected webhook payload');
    }

    const payment = await findQuestPayPayment(payload.data.reference);

    if (!payment) {
      console.warn('QuestPay webhook has no matching checkout', {
        reference: payload.data.reference,
        event: headerEvent,
      });
      return res.status(200).send('Webhook acknowledged');
    }

    if (headerEvent === 'checkout.failed') {
      await failQuestPayPayment(payment, 'QuestPay checkout failed');
      return res.status(200).send('Webhook processed');
    }

    if (payload.data.status !== 'success') {
      console.warn('QuestPay payment.received event was not successful', {
        reference: payload.data.reference,
        status: payload.data.status,
      });
      return res.status(200).send('Webhook acknowledged');
    }

    if (
      !payload.data.checkout ||
      typeof payload.data.checkout.reference !== 'string'
    ) {
      console.warn('QuestPay payment has no linked checkout; not processing', {
        reference: payload.data.reference,
      });
      return res.status(200).send('Webhook acknowledged');
    }
    if (
      payload.data.checkout.reference.toLowerCase() !==
      payment.reference.toLowerCase()
    ) {
      return res.status(400).send('Checkout reference mismatch');
    }

    await completeQuestPayPayment(payment, payload.data);
    return res.status(200).send('Webhook processed');
  } catch (error) {
    next(error);
  }
};
