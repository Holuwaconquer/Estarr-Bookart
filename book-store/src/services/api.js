// API service for backend integration
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE_URL = rawBase.replace(/\/+$/,'') + '/api';

const parseJSON = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
};

const request = async (path, options = {}) => {
  const url = API_BASE_URL + path;
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await parseJSON(res);
    const message = (body && body.message) || (typeof body === 'string' ? body : 'Request failed');
    const error = new Error(message);
    error.status = res.status;
    error.body = body;
    throw error;
  }
  return parseJSON(res);
};

const getToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('accessToken') || null;
};

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const bookAPI = {
  getAllBooks: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const path = `/books${query ? `?${query}` : ''}`;
    return request(path, { headers: { 'Content-Type': 'application/json' } });
  },

  getBookById: async (id) => {
    return request(`/books/${id}`, { headers: { 'Content-Type': 'application/json' } });
  },

  searchBooks: async (q, params = {}) => {
    return bookAPI.getAllBooks({ ...params, search: q });
  }
};

export const cartAPI = {
  // Keep local cart operations client-side; order creation uses backend
  getCart: async () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return { data: { items: cart } };
  },

  addToCart: async (bookId, quantity = 1) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const idx = cart.findIndex(i => i.book === bookId);
    if (idx > -1) cart[idx].quantity += quantity;
    else cart.push({ book: bookId, quantity });
    localStorage.setItem('cart', JSON.stringify(cart));
    return { success: true };
  },

  removeFromCart: async (bookId) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]').filter(i => i.book !== bookId);
    localStorage.setItem('cart', JSON.stringify(cart));
    return { success: true };
  },

  updateCartItem: async (bookId, quantity) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const item = cart.find(i => i.book === bookId);
    if (item) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        const filtered = cart.filter(i => i.book !== bookId);
        localStorage.setItem('cart', JSON.stringify(filtered));
      } else {
        item.quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
      }
    }
    return { success: true };
  },

  clearCart: async () => {
    localStorage.removeItem('cart');
    return { success: true };
  },

  createOrder: async (orderPayload) => {
    return request('/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify(orderPayload)
    });
  }
};

export const userAPI = {
  login: async (credentials) => {
    const res = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    // Save token and user
    if (res && res.data && res.data.token) {
      localStorage.setItem('token', res.data.token);
    } else if (res && res.data && res.data.accessToken) {
      localStorage.setItem('token', res.data.accessToken);
    }
    if (res && res.data && res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
    return res;
  },

  register: async (payload) => {
    const res = await request('/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res && res.data) {
      if (res.data.token) localStorage.setItem('token', res.data.token);
      else if (res.data.accessToken) localStorage.setItem('token', res.data.accessToken);
      if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res;
  },

  verifyResetCode: async (email, code) => {
    return request('/auth/verify-reset-code', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
  },

  oauthGoogle: async (idToken) => {
    const res = await request('/auth/google', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    if (res && res.data) {
      if (res.data.token) localStorage.setItem('token', res.data.token);
      if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res;
  },

  oauthFacebook: async (accessToken) => {
    const res = await request('/auth/facebook', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken })
    });
    if (res && res.data) {
      if (res.data.token) localStorage.setItem('token', res.data.token);
      if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res;
  },

  forgotPassword: async (email) => {
    return request('/auth/forgot-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  },

  resetPassword: async (token, password) => {
    return request(`/auth/reset-password/${token}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
  },

  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true };
  },

  getProfile: async () => {
    return request('/auth/me', { headers: { ...authHeaders() } });
  },

  updateProfile: async (profileData) => {
    return request('/auth/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify(profileData)
    });
  },

  changePassword: async (currentPassword, newPassword) => {
    return request('/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  // Admin user management endpoints
  getAllUsers: async () => {
    return request('/users', {
      headers: { ...authHeaders() }
    });
  },

  getUserById: async (userId) => {
    return request(`/users/${userId}`, {
      headers: { ...authHeaders() }
    });
  },

  updateUser: async (userId, userData) => {
    return request(`/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify(userData)
    });
  },

  deleteUser: async (userId) => {
    return request(`/users/${userId}`, {
      method: 'DELETE',
      headers: { ...authHeaders() }
    });
  },

  updateUserRole: async (userId, role) => {
    return request(`/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({ role })
    });
  },

  // Wishlist endpoints - using local storage since backend doesn't have wishlist API
  getWishlist: async () => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      return { data: wishlist, success: true };
    } catch (error) {
      return { data: [], success: false };
    }
  },

  addToWishlist: async (bookId) => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (!wishlist.find(id => id === bookId)) {
        wishlist.push(bookId);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
      }
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  removeFromWishlist: async (bookId) => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const filtered = wishlist.filter(id => id !== bookId);
      localStorage.setItem('wishlist', JSON.stringify(filtered));
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  // Payment APIs
  initializeKorapayPayment: async (orderId) => {
    return request('/payments/korapay/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({ orderId })
    });
  },

  verifyKorapayPayment: async (reference) => {
    return request('/payments/korapay/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({ reference })
    });
  },

  createManualTransferPayment: async (orderId) => {
    return request('/payments/manual-transfer/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({ orderId })
    });
  },

  uploadProofOfPayment: async (paymentId, formData) => {
    return request(`/payments/${paymentId}/upload-proof`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData
    });
  },

  getBankAccounts: async () => {
    return request('/payments/bank-accounts', {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  getPaymentDetails: async (paymentId) => {
    return request(`/payments/${paymentId}`, {
      headers: { ...authHeaders() }
    });
  },

  getMyPayments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/payments/my-payments${query ? `?${query}` : ''}`, {
      headers: { ...authHeaders() }
    });
  }
};

// Auth API - alias for authentication methods
export const authAPI = {
  login: userAPI.login,
  register: userAPI.register,
  verifyResetCode: userAPI.verifyResetCode,
  oauthGoogle: userAPI.oauthGoogle,
  oauthFacebook: userAPI.oauthFacebook,
  forgotPassword: userAPI.forgotPassword,
  resetPassword: userAPI.resetPassword,
  logout: userAPI.logout,
  getProfile: userAPI.getProfile
};

export const orderAPI = {
  createOrder: async (orderData) => {
    return request('/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify(orderData)
    });
  },

  getMyOrders: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/orders/my-orders${query ? `?${query}` : ''}`, {
      headers: { ...authHeaders() }
    });
  },

  getOrderById: async (orderId) => {
    return request(`/orders/${orderId}`, {
      headers: { ...authHeaders() }
    });
  },

  getAllOrders: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/orders${query ? `?${query}` : ''}`, {
      headers: { ...authHeaders() }
    });
  },

  updateOrderStatus: async (orderId, status, adminNotes) => {
    return request(`/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({ status, adminNotes })
    });
  },

  cancelOrder: async (orderId, reason) => {
    return request(`/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({ reason })
    });
  },

  adminCancelOrder: async (orderId, reason) => {
    return request(`/orders/${orderId}/admin-cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({ reason })
    });
  },

  requestRefund: async (orderId) => {
    return request(`/orders/${orderId}/request-refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      }
    });
  },

  approveRefund: async (orderId) => {
    return request(`/orders/${orderId}/approve-refund`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      }
    });
  }
};

export const blogAPI = {
  getAllBlogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/blog${query ? `?${query}` : ''}`, {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  getAdminBlogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/blog/admin/all${query ? `?${query}` : ''}`, {
      headers: { ...authHeaders() }
    });
  },

  getBlogBySlug: async (slug) => {
    return request(`/blog/${slug}`, {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  getBlogById: async (id) => {
    return request(`/blog/admin/${id}`, {
      headers: { ...authHeaders() }
    });
  },

  createBlog: async (blogData) => {
    return request('/blog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify(blogData)
    });
  },

  updateBlog: async (id, blogData) => {
    return request(`/blog/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify(blogData)
    });
  },

  deleteBlog: async (id) => {
    return request(`/blog/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders() }
    });
  },

  likeBlog: async (id) => {
    return request(`/blog/${id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  addComment: async (id, comment) => {
    return request(`/blog/${id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify({ comment })
    });
  },

  getCategories: async () => {
    return request('/blog/categories', {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const reviewAPI = {
  addReview: async (reviewData) => {
    return request('/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify(reviewData)
    });
  },

  getBookReviews: async (bookId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/reviews/book/${bookId}${query ? `?${query}` : ''}`, {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  getMyReviews: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/reviews/my-reviews${query ? `?${query}` : ''}`, {
      headers: { ...authHeaders() }
    });
  },

  updateReview: async (reviewId, reviewData) => {
    return request(`/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify(reviewData)
    });
  },

  deleteReview: async (reviewId) => {
    return request(`/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: { ...authHeaders() }
    });
  },

  markHelpful: async (reviewId) => {
    return request(`/reviews/${reviewId}/helpful`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  markUnhelpful: async (reviewId) => {
    return request(`/reviews/${reviewId}/unhelpful`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Admin Book API
export const adminBookAPI = {
  createBook: async (bookData) => {
    return request('/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify(bookData)
    });
  },

  updateBook: async (id, bookData) => {
    return request(`/books/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify(bookData)
    });
  },

  deleteBook: async (id) => {
    return request(`/books/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders() }
    });
  },

  getAdminBooks: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/books${query ? `?${query}` : ''}`, {
      headers: { ...authHeaders() }
    });
  }
};

// Update bookAPI to include admin methods
bookAPI.createBook = adminBookAPI.createBook;
bookAPI.updateBook = adminBookAPI.updateBook;
bookAPI.deleteBook = adminBookAPI.deleteBook;
bookAPI.getAdminBooks = adminBookAPI.getAdminBooks;

// Category API for frontend - uses /categories endpoint managed by admin
export const categoryAPI = {
  getAllCategories: async () => {
    return request('/categories', {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  getCategoryById: async (id) => {
    return request(`/categories/${id}`, {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  getCategoryBySlug: async (slug) => {
    return request(`/categories/slug/${slug}`, {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  createCategory: async (categoryData) => {
    return request('/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify(categoryData)
    });
  },

  updateCategory: async (id, categoryData) => {
    return request(`/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify(categoryData)
    });
  },

  deleteCategory: async (id) => {
    return request(`/categories/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders() }
    });
  },

  getAdminCategories: async () => {
    return request('/categories/admin/all', {
      headers: { ...authHeaders() }
    });
  }
};

export const bankAccountAPI = {
  getAllBankAccounts: async () => {
    return request('/bank-accounts', {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  getBankAccount: async (id) => {
    return request(`/bank-accounts/${id}`, {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  createBankAccount: async (accountData) => {
    return request('/bank-accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify(accountData)
    });
  },

  updateBankAccount: async (id, accountData) => {
    return request(`/bank-accounts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify(accountData)
    });
  },

  deleteBankAccount: async (id) => {
    return request(`/bank-accounts/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders() }
    });
  },

  toggleBankAccountStatus: async (id) => {
    return request(`/bank-accounts/${id}/toggle`, {
      method: 'PATCH',
      headers: { ...authHeaders() }
    });
  }
};

export default {
  authAPI,
  bookAPI,
  cartAPI,
  userAPI,
  orderAPI,
  blogAPI,
  reviewAPI,
  categoryAPI,
  bankAccountAPI
};