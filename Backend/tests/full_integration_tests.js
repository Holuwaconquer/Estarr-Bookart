// Comprehensive integration tests for Backend API
// Runs sequentially and reports results to the console.

require('dotenv').config();
const fetch = global.fetch;
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const BASE = process.env.API_BASE || `http://localhost:${process.env.PORT || 5000}`;
const API = BASE.replace(/\/+$/,'') + '/api';

const waitForServer = async (timeout = 30000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(BASE + '/health');
      if (res.ok) return true;
    } catch (e) {}
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error('Server did not become ready in time');
};

const safe = async (name, fn, expectStatus = null) => {
  try {
    const res = await fn();
    const status = res.status;
    const body = await (async () => { try { return await res.json(); } catch { return await res.text(); } })();
    const ok = expectStatus ? status === expectStatus : res.ok;
    console.log(`${ok ? '✔' : '✖'} ${name}: ${status}`);
    if (!ok) console.log('  Response body:', body);
    return { res, body };
  } catch (err) {
    console.error(`✖ ${name}:`, err.message || err);
    return null;
  }
};

const request = (path, opts = {}) => fetch(API + path, opts);

const generateRandomEmail = () => `test+${Date.now()}@example.com`;

const run = async () => {
  console.log('Waiting for server...');
  await waitForServer();
  console.log('Server ready — running comprehensive checks');

  // Basic public endpoints
  await safe('Health', () => fetch(BASE + '/health'));
  await safe('Get all books', () => request('/books'));

  // Auth flow: register -> login -> me -> update profile -> change password -> forgot/reset
  const userEmail = generateRandomEmail();
  const userPassword = 'Password123!';

  // Register
  const reg = await safe('Register user', () => request('/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: userEmail, password: userPassword })
  }), 200);

  let userToken = reg && reg.body && reg.body.data && (reg.body.data.token || reg.body.data.accessToken);
  let userId = reg && reg.body && reg.body.data && reg.body.data.user && reg.body.data.user.id;

  // Login if token not returned
  if (!userToken) {
    const login = await safe('Login user', () => request('/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, password: userPassword })
    }), 200);
    userToken = login && login.body && (login.body.data.token || login.body.data.accessToken || (login.body.data && login.body.data.access_token));
    userId = login && login.body && login.body.data && login.body.data.user && login.body.data.user.id;
  }

  if (!userToken) {
    console.error('Failed to obtain user token — aborting protected route tests');
    return;
  }

  // Get profile
  await safe('Get profile', () => request('/auth/me', { headers: { Authorization: `Bearer ${userToken}` } }), 200);

  // Update profile
  await safe('Update profile', () => request('/auth/me', {
    method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ name: 'Updated Test User' })
  }), 200);

  // Change password
  await safe('Change password', () => request('/auth/change-password', {
    method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ currentPassword: userPassword, newPassword: 'NewPass123!' })
  }), 200);

  // Re-login with new password
  const relogin = await safe('Login with new password', () => request('/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userEmail, password: 'NewPass123!' })
  }), 200);
  userToken = relogin && relogin.body && (relogin.body.data.token || relogin.body.data.accessToken) || userToken;

  // Forgot password -> reset
  const forgot = await safe('Forgot password', () => request('/auth/forgot-password', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userEmail })
  }), 200);

  let resetToken = forgot && forgot.body && forgot.body.data && forgot.body.data.resetToken;
  if (resetToken) {
    await safe('Reset password', () => request(`/auth/reset-password/${resetToken}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'ResetPass123!' })
    }), 200);

    await safe('Login with reset password', () => request('/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, password: 'ResetPass123!' })
    }), 200);
  } else {
    console.log('Forgot-password did not return token; manual reset test skipped');
  }

  // Prepare admin token: try to create via JWT if secret available
  let adminToken = null;
  try {
    const secret = process.env.JWT_SECRET;
    if (secret && userId) {
      // Sign a token for admin actions
      adminToken = jwt.sign({ userId: userId, role: 'admin' }, secret, { expiresIn: '7d' });
      console.log('Created admin token from JWT_SECRET for admin tests');
    }
  } catch (e) {
    console.log('Could not create admin token:', e.message || e);
  }

  // If no admin token, try to register an admin user via register and hope role default can be set (unlikely)
  if (!adminToken) {
    const adminEmail = generateRandomEmail();
    const adminPwd = 'AdminPass123!';
    const adminReg = await safe('Register admin candidate', () => request('/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Admin Candidate', email: adminEmail, password: adminPwd })
    }), 200);
    const adminTok = adminReg && adminReg.body && (adminReg.body.data.token || adminReg.body.data.accessToken);
    if (adminTok) {
      adminToken = adminTok;
    } else {
      // Try promoting the created user to admin directly in MongoDB, then login to get admin token
      try {
        if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI not set in env');
        await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        const usersColl = mongoose.connection.collection('users');
        const updateRes = await usersColl.updateOne({ email: adminEmail }, { $set: { role: 'admin' } });
        if (updateRes.matchedCount === 0) {
          console.log('Admin promotion: no matching user found in DB for', adminEmail);
        } else {
          console.log('Admin promotion: user updated in DB');
          // Attempt login to get token
          const adminLogin = await safe('Login admin after promotion', () => request('/auth/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminEmail, password: adminPwd })
          }), 200);
          const adminTok2 = adminLogin && adminLogin.body && (adminLogin.body.data.token || adminLogin.body.data.accessToken);
          if (adminTok2) adminToken = adminTok2;
        }
      } catch (err) {
        console.log('Admin promotion failed:', err.message || err);
      } finally {
        try { await mongoose.disconnect(); } catch (e) {}
      }
    }
  }

  if (!adminToken) console.log('Admin token not available — admin-only tests may fail (403)');

  // Admin create book (requires admin)
  const bookPayload = {
    title: 'Integration Test Book', author: 'Tester', description: 'Test book', price: 49.99,
    image: 'https://example.com/book.png', stock: 10, category: 'fiction'
  };

  const createBookRes = await safe('Admin create book', () => request('/books', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify(bookPayload)
  }));

  const createdBookId = createBookRes && createBookRes.body && createBookRes.body.data && (createBookRes.body.data._id || createBookRes.body.data.id || createBookRes.body.data);

  // If book created, update, get, delete tests
  if (createdBookId) {
    await safe('Get created book', () => request(`/books/${createdBookId}`), 200);
    await safe('Update book', () => request(`/books/${createdBookId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ price: 39.99 })
    }), 200);

    // Create order as user for this book
    const orderRes = await safe('Create order (user)', () => request('/orders', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ items: [{ book: createdBookId, quantity: 1 }], shippingAddress: { street: '1 Test St', city: 'City', state: 'ST', zipCode: '00000', country: 'Country' }, paymentMethod: 'card' })
    }));

    const orderId = orderRes && orderRes.body && orderRes.body.data && (orderRes.body.data._id || orderRes.body.data.id || orderRes.body.data);

    if (orderId) {
      await safe('Get my orders (user)', () => request('/orders/my-orders', { headers: { Authorization: `Bearer ${userToken}` } }), 200);
      await safe('Get order by id', () => request(`/orders/${orderId}`, { headers: { Authorization: `Bearer ${userToken}` } }), 200);
      await safe('Cancel order', () => request(`/orders/${orderId}/cancel`, { method: 'PUT', headers: { Authorization: `Bearer ${userToken}` } }), 200);

      // Create another order to test payment status update
      const orderRes2 = await safe('Create order 2 (user)', () => request('/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({ items: [{ book: createdBookId, quantity: 1 }], shippingAddress: { street: '1 Test St', city: 'City', state: 'ST', zipCode: '00000', country: 'Country' }, paymentMethod: 'card' })
      }));
      const orderId2 = orderRes2 && orderRes2.body && orderRes2.body.data && (orderRes2.body.data._id || orderRes2.body.data.id || orderRes2.body.data);
      if (orderId2) {
        await safe('Update payment status (user)', () => request(`/orders/${orderId2}/payment-status`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
          body: JSON.stringify({ paymentStatus: 'completed', paymentId: 'pay_12345' })
        }), 200);

        // Admin: get all orders and update order status
        if (adminToken) {
          await safe('Admin get all orders', () => request('/orders', { headers: { Authorization: `Bearer ${adminToken}` } }), 200);
          await safe('Admin update order status', () => request(`/orders/${orderId2}/status`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({ status: 'processing' })
          }), 200);
        }
      }
    }

    // Delete the book
    await safe('Delete book', () => request(`/books/${createdBookId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } }));
  } else {
    console.log('Book creation failed — skipping book/order admin tests');
  }

  console.log('\nComprehensive integration tests completed');
};

run().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
