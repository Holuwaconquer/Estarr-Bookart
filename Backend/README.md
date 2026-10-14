# QuestPay hosted checkout

QuestPay hosted bank transfer is currently the only payment method available
for new checkout orders. Manual bank transfer is disabled for new orders.

## Backend configuration

Set these variables in the backend deployment environment:

```env
QUESTPAY_API_KEY=your_questpay_api_key
QUESTPAY_BASE_URL=https://payments-api.questlabs.cc/api
QUESTPAY_WEBHOOK_PATH=/api/webhooks/questpay
FRONTEND_URL=https://your-storefront-domain
```

Do not commit a live API key. `QUESTPAY_BASE_URL` can point at the provider's
test environment when QuestPay supplies one. The frontend returns to
`/checkout`; the API verifies the payment with QuestPay before marking its
order paid. The MongoDB deployment must support transactions (MongoDB Atlas or
a replica set) so failed checkouts can release reserved stock atomically.

## Webhook configuration and behavior

Configure QuestPay to send checkout events to:

```text
https://your-backend-domain/api/webhooks/questpay
```

The endpoint accepts raw JSON so it can validate the provider's
`x-questpay-signature` HMAC-SHA256 against the exact request bytes using
`QUESTPAY_API_KEY`. It handles `payment.received` only when the event reports
success and the payment matches the stored checkout reference, user, order,
and amount. The customer order-confirmation email is sent only after QuestPay
confirms payment. Failed/expired checkouts cancel the pending order and release
its reserved stock. Duplicate notifications do not complete or release an
order twice.

## Local verification

1. Configure the backend and storefront environment variables and start both
   applications.
2. Create an order and select **QuestPay Bank Transfer** at checkout. Confirm
   the browser redirects to the hosted checkout URL.
3. Complete a provider test payment and confirm the checkout return verifies
   the payment and clears the cart.
4. Send a provider-signed failed/expired notification and confirm the order is
   cancelled and reserved stock restored.
5. Send an invalid signature and confirm the webhook returns HTTP 400 without
   changing payment or order state.

The manual transfer/proof-upload handlers remain in the code for existing
orders, but new orders can only be created with QuestPay.
