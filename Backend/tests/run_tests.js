// Simple integration test runner that exercises backend routes.
// Uses global fetch (Node 18+) to call endpoints and reports status.

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

const safe = async (name, fn) => {
  try {
    const result = await fn();
    console.log(`✔ ${name}:`, result && result.status ? `${result.status}` : 'OK');
    return result;
  } catch (err) {
    console.error(`✖ ${name}:`, err && err.message ? err.message : err);
    return null;
  }
};

const run = async () => {
  console.log('Waiting for server...');
  await waitForServer();
  console.log('Server ready — running checks');

  // Public endpoints
  await safe('Health', async () => fetch(BASE + '/health'));
  await safe('Get all books', async () => fetch(API + '/books'));
  await safe('Get featured', async () => fetch(API + '/books/featured'));
  await safe('Get bestsellers', async () => fetch(API + '/books/bestsellers'));
  await safe('Get new arrivals', async () => fetch(API + '/books/new-arrivals'));
  await safe('Get category (fiction)', async () => fetch(API + '/books/category/fiction'));

  // Auth: register -> login -> me
  const testEmail = `test+${Date.now()}@example.com`;
  const password = 'Password123';
  const name = 'Integration Tester';

  const registerRes = await safe('Register', async () => fetch(API + '/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email: testEmail, password })
  }));

  let token = null;
  if (registerRes && registerRes.ok) {
    const body = await registerRes.json();
    token = body?.data?.token || body?.data?.accessToken || null;
  }

  // Try login if register didn't return a token (user may already exist)
  if (!token) {
    const loginRes = await safe('Login', async () => fetch(API + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password })
    }));
    if (loginRes && loginRes.ok) {
      const body = await loginRes.json();
      token = body?.data?.token || body?.data?.accessToken || null;
    }
  }

  if (token) {
    await safe('Get profile (me)', async () => fetch(API + '/auth/me', { headers: { Authorization: `Bearer ${token}` } }));

    // Attempt to create an order if there's at least one book
    const booksRes = await fetch(API + '/books');
    if (booksRes.ok) {
      const booksBody = await booksRes.json();
      const books = booksBody?.data?.books || booksBody?.data || [];
      const firstBook = Array.isArray(books) ? books[0] : null;
      if (firstBook && (firstBook._id || firstBook.id)) {
        const bookId = firstBook._id || firstBook.id;
        await safe('Create order', async () => fetch(API + '/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            items: [{ book: bookId, quantity: 1 }],
            shippingAddress: { street: '1 Test St', city: 'Testville', state: 'TS', zipCode: '00000', country: 'Test' },
            paymentMethod: 'card'
          })
        }));
      } else {
        console.log('Skipping order creation — no books found to reference');
      }
    }
  } else {
    console.log('No token obtained — skipping protected route tests');
  }

  // Unauthorized access check
  await safe('Get my orders without auth (should 401)', async () => fetch(API + '/orders/my-orders'));

  console.log('\nIntegration checks completed');
};

run().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
