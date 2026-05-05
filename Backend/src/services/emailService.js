const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Admin email address
const ADMIN_EMAIL = 'estheribukunoluwa100@gmail.com';

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
              <p>EStarr Bookart Hub | Automated Order Notification</p>
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
        <td style="padding: 8px;">${item.title}</td>
        <td style="padding: 8px; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; text-align: right;">₦${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'EStarr Bookart <orders@estarrbookart.com.ng>',
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
              <h1>✅ Order Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${user.name || 'Valued Customer'}</strong>,</p>
              <p>Thank you for your order! We've received it and will process it shortly.</p>
              <div class="order-info">
                <p><strong>Order #:</strong> ${order.orderNumber || order._id.slice(-8)}</p>
                <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <h3>Order Summary</h3>
              <table>
                <tr><th>Item</th><th>Qty</th><th>Total</th></tr>
                ${itemsList}
              </table>
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

module.exports = {
  sendOrderNotificationEmail,
  sendOrderConfirmationEmail
};