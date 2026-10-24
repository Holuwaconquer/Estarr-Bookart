const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Admin email address
const ADMIN_EMAIL = 'estarrbookart@gmail.com';
// const ADMIN_EMAIL = 'holuwaconquer488@gmail.com';

const sendOrderNotificationEmail = async (order, user) => {
  try {
    // Format order items for email
    const itemsList = order.items.map(item => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px;">
          <img src="${item.image || 'https://estarrbookart.com.ng/estarr.jpeg'}" alt="${item.title}" style="width: 50px; height: 60px; object-fit: cover; border-radius: 8px;">
        </td>
        <td style="padding: 12px;">
          <strong>${item.title}</strong><br>
          <span style="color: #6b7280; font-size: 12px;">by ${item.author}</span>
        </td>
        <td style="padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right;">₦${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    const { data, error } = await resend.emails.send({
      from: 'EStarr Bookart <noreply@estarrbookart.com.ng>',
      to: ADMIN_EMAIL,
      subject: `🛒 New Order Received - Order #${order.orderNumber || order._id.slice(-8)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              margin: 0;
              padding: 0;
              background-color: #f3f4f6;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #06b6d4, #3b82f6);
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              color: rgba(255,255,255,0.9);
              margin: 10px 0 0;
            }
            .content {
              padding: 30px;
            }
            .order-info {
              background: #f9fafb;
              padding: 15px;
              border-radius: 12px;
              margin-bottom: 20px;
              border-left: 4px solid #06b6d4;
            }
            .order-info p {
              margin: 5px 0;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin: 20px 0 15px;
              padding-bottom: 10px;
              border-bottom: 2px solid #e5e7eb;
              color: #1f2937;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th {
              background: #f3f4f6;
              padding: 12px;
              text-align: left;
              font-weight: 600;
              color: #374151;
            }
            .totals {
              background: #f9fafb;
              padding: 15px;
              border-radius: 12px;
              margin-top: 20px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
            }
            .totals-row.grand-total {
              border-top: 2px solid #e5e7eb;
              margin-top: 8px;
              padding-top: 12px;
              font-weight: bold;
              font-size: 18px;
              color: #06b6d4;
            }
            .badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
            }
            .badge-pending { background: #fef3c7; color: #92400e; }
            .badge-processing { background: #dbeafe; color: #1e40af; }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #06b6d4, #3b82f6);
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              margin-top: 20px;
            }
            .footer {
              background: #f9fafb;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📚 New Order Received!</h1>
              <p>Order #${order.orderNumber || order._id.slice(-8)}</p>
            </div>
            
            <div class="content">
              <div class="order-info">
                <p><strong>🕐 Order Time:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                <p><strong>💰 Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
                <p><strong>📦 Order Status:</strong> <span class="badge badge-pending">${order.status}</span></p>
                <p><strong>💳 Payment Status:</strong> <span class="badge badge-processing">${order.paymentStatus}</span></p>
              </div>

              <h3 class="section-title">👤 Customer Information</h3>
              <div class="order-info">
                <p><strong>Name:</strong> ${user?.name || 'N/A'}</p>
                <p><strong>Email:</strong> ${user?.email || 'N/A'}</p>
                <p><strong>Phone:</strong> ${order.shippingAddress?.phone || user?.phonenumber || 'N/A'}</p>
              </div>

              <h3 class="section-title">📍 Shipping Address</h3>
              <div class="order-info">
                <p>${order.shippingAddress?.street || 'N/A'}</p>
                <p>${order.shippingAddress?.city || 'N/A'}, ${order.shippingAddress?.state || 'N/A'}</p>
                <p>${order.shippingAddress?.zipCode || 'N/A'}, ${order.shippingAddress?.country || 'Nigeria'}</p>
              </div>

              <h3 class="section-title">🛍️ Order Items</h3>
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
              </table>

              <div class="totals">
                <div class="totals-row">
                  <span>Subtotal:</span>
                  <span>₦${order.subtotal?.toLocaleString() || 0}</span>
                </div>
                <div class="totals-row">
                  <span>Shipping Fee:</span>
                  <span>₦${order.shippingFee?.toLocaleString() || 0}</span>
                </div>
                <div class="totals-row grand-total">
                  <span>Total:</span>
                  <span>₦${order.total?.toLocaleString() || 0}</span>
                </div>
              </div>

              <div style="text-align: center;">
                <a href="https://estarrbookart.com.ng/admin/orders/${order._id}" class="button">
                  View Order in Admin Panel →
                </a>
              </div>

              <p style="margin-top: 20px; font-size: 14px; color: #6b7280; text-align: center;">
                This order requires your attention. Please process it as soon as possible.
              </p>
            </div>
            
            <div class="footer">
              <p>EStarr Bookart | Automated Order Notification</p>
              <p>📍 OAU, Ile-Ife, Osun State, Nigeria</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Admin notification email error:', error);
      return false;
    }
    
    console.log('✅ Admin notification email sent for order:', order._id);
    return true;
  } catch (error) {
    console.error('❌ Failed to send admin notification:', error);
    return false;
  }
};

// Send order confirmation to customer
const sendOrderConfirmationEmail = async (order, user) => {
  try {
    const itemsList = order.items.map(item => `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; width: 64px;">
          <img src="${item.image || 'https://estarrbookart.com.ng/estarr.jpeg'}" alt="${item.title}" style="width: 48px; height: 64px; object-fit: cover; border-radius: 6px;" />
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.title}</strong><br />
          <span style="color: #6b7280; font-size: 12px;">by ${item.author || 'EStarr Bookart'}</span>
        </td>
        <td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
        <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #e5e7eb; white-space: nowrap;">₦${item.price?.toLocaleString() || 0}</td>
        <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #e5e7eb; white-space: nowrap;"><strong>₦${(item.price * item.quantity).toLocaleString()}</strong></td>
      </tr>
    `).join('');

    const { data, error } = await resend.emails.send({
      from: 'EStarr Bookart <orders@estarrbookart.com.ng>',
      to: user.email,
      subject: `Order Confirmation - #${order.orderNumber || order._id.slice(-8)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6; }
            .container { max-width: 500px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 30px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .order-info { background: #f9fafb; padding: 15px; border-radius: 12px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f3f4f6; padding: 10px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
            .total { font-weight: bold; font-size: 18px; color: #06b6d4; text-align: right; margin-top: 15px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Payment Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${user.name || 'Valued Customer'}</strong>,</p>
              <p>Thank you for your payment. Your order is confirmed and will be prepared for shipment.</p>
              <div class="order-info">
                <p><strong>Order #:</strong> ${order.orderNumber || order._id.slice(-8)}</p>
                <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                <p><strong>Status:</strong> ${order.status || 'pending'}</p>
                <p><strong>Payment method:</strong> ${order.paymentMethod || 'N/A'}</p>
              </div>
              <h3>Order Summary</h3>
              <table>
                <tr>
                  <th style="text-align: left;">Image</th>
                  <th style="text-align: left;">Product</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Unit price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
                ${itemsList}
              </table>
              <div class="order-info">
                <p><strong>Shipping to:</strong></p>
                <p>${order.shippingAddress?.street || 'N/A'}, ${order.shippingAddress?.city || 'N/A'}, ${order.shippingAddress?.state || 'N/A'}</p>
              </div>
              <div class="total">Total: ₦${order.total?.toLocaleString()}</div>
              <p style="margin-top: 20px;">We'll notify you once your order ships.</p>
              <p>Happy reading!<br>EStarr Bookart Team</p>
            </div>
            <div class="footer">
              <p>Questions? Contact us at support@estarrbookart.com.ng</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Order confirmation email error:', error);
      return false;
    }
    
    console.log('✅ Order confirmation email sent to:', user.email);
    return true;
  } catch (error) {
    console.error('❌ Failed to send order confirmation:', error);
    return false;
  }
};

const sendOrderStatusUpdateEmail = async (order, user, previousStatus) => {
  try {
    if (!user?.email || previousStatus === order.status) return false;

    const orderReference = order.orderNumber || order._id.toString().slice(-8);
    const statusLabel = order.status.charAt(0).toUpperCase() + order.status.slice(1);
    const { error } = await resend.emails.send({
      from: 'EStarr Bookart <orders@estarrbookart.com.ng>',
      to: user.email,
      subject: `Order #${orderReference} status update: ${statusLabel}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #28202f; background: #faf9f7; padding: 28px;">
          <div style="background: #28202f; color: #fff; border-radius: 16px 16px 0 0; padding: 24px;">
            <p style="margin: 0 0 8px; color: #d7f36a; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Estarr Bookart</p>
            <h1 style="margin: 0; font-size: 24px;">Your order has been updated</h1>
          </div>
          <div style="background: #fff; padding: 28px; border: 1px solid #e8e3dc; border-top: 0; border-radius: 0 0 16px 16px;">
            <p>Hello ${user.name || 'Valued Customer'},</p>
            <p>Your order <strong>#${orderReference}</strong> has moved from <strong>${previousStatus}</strong> to:</p>
            <p style="display: inline-block; background: #f0eafb; color: #5b21b6; border-radius: 999px; padding: 8px 16px; font-weight: 700;">${statusLabel}</p>
            <p>Total: <strong>₦${order.total?.toLocaleString() || 0}</strong></p>
            <p>We will keep you informed as your order progresses.</p>
            <p style="margin-bottom: 0;">Thank you for shopping with us,<br />EStarr Bookart Team</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Order status email error:', error);
      return false;
    }

    console.log('Order status email sent:', { orderId: order._id, status: order.status, email: user.email });
    return true;
  } catch (error) {
    console.error('Failed to send order status email:', error);
    return false;
  }
};

const sendNewsletterSubscriptionEmail = async (
  email,
  { sendWelcome = true, sendAdmin = true } = {},
) => {
  const safeEmail = email.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
  const from = `EStarr Bookart <${process.env.RESEND_FROM_EMAIL || 'noreply@estarrbookart.com.ng'}>`;
  const messages = [];
  if (sendWelcome) {
    messages.push({
      type: 'welcome',
      delivery: resend.emails.send({
      from,
      to: email,
      subject: 'You’re subscribed to the EStarr Bookart newsletter',
      text: `Welcome to EStarr Bookart!\n\nYour email address has been subscribed to our regular newsletter. Look out for new book arrivals, reading recommendations, and special offers.\n\nThank you for joining us,\nThe EStarr Bookart Team`,
      html: `
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Welcome to EStarr Bookart</title>
          </head>
          <body style="margin:0; padding:32px 16px; background-color:#f4f1f8; font-family:Arial,Helvetica,sans-serif; color:#28202f;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px; margin:0 auto; background-color:#ffffff; border:1px solid #e8e2f0; border-radius:12px; overflow:hidden;">
              <tr>
                <td style="padding:30px 32px; background-color:#4c1d95; color:#ffffff;">
                  <p style="margin:0 0 8px; color:#e9ddff; font-size:12px; font-weight:bold; letter-spacing:2px; text-transform:uppercase;">EStarr Bookart</p>
                  <h1 style="margin:0; font-size:26px; line-height:1.3;">Welcome to the reading list</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;">
                  <p style="margin:0 0 16px; color:#28202f; font-size:17px; line-height:1.6;">You’re subscribed!</p>
                  <p style="margin:0 0 20px; color:#51485c; font-size:15px; line-height:1.7;">We’ll send our regular newsletter to <strong>${safeEmail}</strong>, with new book arrivals, reading recommendations, and special offers.</p>
                  <p style="margin:0; color:#51485c; font-size:15px; line-height:1.7;">Thank you for making EStarr Bookart part of your reading journey.</p>
                  <p style="margin:24px 0 0; color:#51485c; font-size:15px; line-height:1.6;">Warmly,<br><strong>The EStarr Bookart Team</strong></p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 32px; border-top:1px solid #eee8f5; color:#8a8194; font-size:12px; line-height:1.5;">
                  You received this message because this email address was submitted on the EStarr Bookart website.
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      }),
    });
  }
  if (sendAdmin) {
    messages.push({
      type: 'admin',
      delivery: resend.emails.send({
      from,
      to: 'estarrbookart@gmail.com',
      subject: 'New newsletter subscriber | EStarr Bookart',
      text: `NEW NEWSLETTER SUBSCRIBER\n\nSomeone has joined the EStarr Bookart reading list.\n\nSubscriber email: ${email}\n\nYou can reply directly to this email address to contact them.`,
      html: `
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>New newsletter subscriber</title>
          </head>
          <body style="margin:0; padding:32px 16px; background-color:#f4f1f8; font-family:Arial,Helvetica,sans-serif; color:#28202f;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px; margin:0 auto; background-color:#ffffff; border:1px solid #e8e2f0; border-radius:12px; overflow:hidden;">
              <tr>
                <td style="padding:28px 32px; background-color:#4c1d95; color:#ffffff;">
                  <p style="margin:0 0 8px; color:#e9ddff; font-size:12px; font-weight:bold; letter-spacing:2px; text-transform:uppercase;">EStarr Bookart</p>
                  <h1 style="margin:0; font-size:24px; line-height:1.3;">A new reader has joined your list</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;">
                  <p style="margin:0 0 20px; color:#51485c; font-size:16px; line-height:1.6;">Someone just subscribed to the EStarr Bookart newsletter. Here are their details:</p>
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#faf8fd; border:1px solid #eee8f5; border-radius:8px;">
                    <tr>
                      <td style="padding:18px 20px;">
                        <p style="margin:0 0 6px; color:#766b82; font-size:12px; font-weight:bold; letter-spacing:1px; text-transform:uppercase;">Subscriber email</p>
                        <a href="mailto:${safeEmail}" style="color:#5b21b6; font-size:17px; font-weight:bold; text-decoration:none; word-break:break-word;">${safeEmail}</a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:24px 0 0; color:#766b82; font-size:14px; line-height:1.6;">You can reply directly to this notification to contact the subscriber.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 32px; border-top:1px solid #eee8f5; color:#8a8194; font-size:12px; line-height:1.5;">
                  This is an automatic notification from the EStarr Bookart website.
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      }),
    });
  }

  const deliveries = await Promise.allSettled(messages.map(({ delivery }) => delivery));
  return deliveries.map((delivery, index) => {
    if (delivery.status === 'rejected') {
      return {
        type: messages[index].type,
        error: String(delivery.reason?.message || delivery.reason),
      };
    }
    return {
      type: messages[index].type,
      error: delivery.value?.error
        ? String(delivery.value.error.message || delivery.value.error)
        : null,
    };
  });
};

module.exports = {
  sendOrderNotificationEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendNewsletterSubscriptionEmail,
};