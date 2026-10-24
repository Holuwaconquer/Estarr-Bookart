# QuestPay hosted checkout

QuestPay hosted bank transfer is currently the only payment method available
for new checkout orders. Manual bank transfer is disabled for new orders.

## Deploy the backend to Vercel

Create a separate Vercel project for the backend and set its **Root Directory**
to `Backend`. Vercel detects and deploys the exported Express app in `app.js`
as a serverless function. Do not set a static output directory, rewrite, or
frontend build command. The local `npm start` command continues to run the
same app as a long-lived Express server.

Add the following environment variables to the Vercel project (Production and
Preview as appropriate):

- `MONGODB_URI` — MongoDB Atlas connection string. Configure database network
  access for the Vercel deployment and use a dedicated database user.
- `JWT_SECRET` and, optionally, `JWT_EXPIRE`.
- `FRONTEND_URL` — exact storefront origin, including `https://`.
- `PRODUCTION_URL` — production storefront origin.
- `BACKEND_URL` — deployed backend origin, used by the legacy Korapay
  notification URL.
- `QUESTPAY_API_KEY` and optionally `QUESTPAY_BASE_URL`.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
  `CLOUDINARY_API_SECRET` for book images and payment proofs.
- `RESEND_API_KEY` for email delivery.
- `RESEND_FROM_EMAIL` — sender address on a domain verified in Resend.
- `KORAPAY_PUBLIC_KEY` and `KORAPAY_SECRET_KEY` only if the legacy Korapay
  routes are used.
- `NODE_ENV=production`.

Deploy, then set QuestPay's webhook URL to
`https://<your-backend-domain>/api/webhooks/questpay`. The webhook-specific
`express.raw()` middleware runs before JSON parsing so it can verify the
original request bytes. Keep `QUESTPAY_WEBHOOK_PATH` at its default unless the
provider is configured with the same custom path.

Vercel functions have ephemeral filesystems and a request-body size limit.
Uploaded book images and payment proofs are stored in Cloudinary rather than
local disk. Multipart uploads are capped at 4 MB to stay below Vercel's request
limit. The deployment excludes `public/uploads/` so legacy files are not
published as public CDN assets. Any old `/uploads/...` links from another host
are not migrated automatically; move assets to durable storage such as
Cloudinary and update their stored URLs if they are still in use.

The API's in-memory rate limiter is per function instance and is not a
distributed abuse-control mechanism. Use Vercel Firewall or a shared rate-limit
store for production-wide limits. MongoDB sessions/transactions used by
checkout require a replica set (MongoDB Atlas supports this).

Newsletter signups are stored in MongoDB and trigger a confirmation email to
the subscriber plus a notification to the store. Resend must allow delivery to
the subscriber address and the configured sender domain must be verified.
This signup flow does not yet schedule or send recurring newsletter campaigns.
Admin book forms include a built-in description helper that composes copy from
the title, category, author, and optional notes. It uses local rules rather
than an external AI service; generated text should be reviewed before saving.

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
