// API service for backend integration
const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE_URL = rawBase.replace(/\/+$/,'') + '/api';

const parseJSON = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
};

const request = async (path, options = {}) => {
  const url = API_BASE_URL + path;
  
  // Ensure credentials are included for cookies
  options.credentials = 'include';
  
  // Check if body is FormData (do NOT merge headers for FormData - let browser set Content-Type)
  const isFormData = options.body instanceof FormData;
  
  if (!isFormData) {
    // Only add default auth headers for non-FormData requests
    const headers = authHeaders();
    options.headers = { ...options.headers, ...headers };
  } else {
    // For FormData, only add Authorization header, not Content-Type
    const token = getToken();
    options.headers = { ...options.headers };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  console.log('🌐 Making request to:', url);
  console.log('📤 Request headers:', options.headers);
  console.log('📤 Request is FormData:', isFormData);
  
  try {
    const res = await fetch(url, options);
    
    console.log('📥 Response status:', res.status, res.statusText);
    
    if (res.status === 403) {
      const body = await parseJSON(res);
      console.error('🚫 403 Forbidden - Access denied:', body);
      
      if (body.message && body.message.includes('Role undefined')) {
        console.warn('⚠️ Token missing role information');
        
        // Try to get fresh user data
        const user = getCurrentUser();
        if (user) {
          console.log('🔄 Attempting to refresh user role...');
          
          // Force refresh token by logging out and redirecting
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('accessToken');
          
          console.warn('Session expired. Redirecting to login.');
          
          setTimeout(() => {
            if (window.location.pathname.includes('/admin')) {
              window.location.href = '/admin/login';
            } else {
              window.location.href = '/login';
            }
          }, 2000);
        }
      }
    }
    
    if (res.status === 401) {
      console.warn('⚠️ 401 Unauthorized - Token might be invalid');
      // ... existing 401 handling code ...
    }
    
    if (!res.ok) {
      const body = await parseJSON(res);
      const message = (body && body.message) || (typeof body === 'string' ? body : 'Request failed');
      const error = new Error(message);
      error.status = res.status;
      error.body = body;
      throw error;
    }
    
    const parsedResponse = await parseJSON(res);
    
    // Log orders endpoint responses with detailed info
    if (path.includes('/orders')) {
      console.log('📦 Orders endpoint response:', {
        url: path,
        success: parsedResponse.success,
        dataType: typeof parsedResponse.data,
        dataKeys: Object.keys(parsedResponse.data || {}),
        ordersLength: parsedResponse.data?.orders?.length,
        rawData: JSON.stringify(parsedResponse.data)
      });
    }
    
    // Log users endpoint responses with detailed info
    if (path.includes('/users') && path === '/users') {
      console.log('👥 Users endpoint response:', {
        url: path,
        status: parsedResponse.status,
        dataType: typeof parsedResponse.data,
        dataKeys: Object.keys(parsedResponse.data || {}),
        usersLength: parsedResponse.data?.users?.length,
        rawData: JSON.stringify(parsedResponse.data)
      });
    }
    
    return parsedResponse;
  } catch (error) {
    console.error('❌ Request failed:', error);
    
    throw error;
  }
};

const getToken = () => {
  // Check multiple possible token locations
  const tokenSources = [
    // Check localStorage
    localStorage.getItem('token'),
    localStorage.getItem('accessToken'),
    // Check sessionStorage
    sessionStorage.getItem('token'),
    sessionStorage.getItem('accessToken'),
    // Check cookies
    document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1],
    document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1],
  ];

  const token = tokenSources.find(t => t && t !== 'undefined' && t !== 'null');
  
  console.log('🔑 Token sources:', tokenSources);
  console.log('🔑 Found token:', token ? 'Yes' : 'No');
  
  return token;
};

const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

const authHeaders = () => {
  const token = getToken();
  
  console.log('🔑 Auth headers - Token:', token ? `Yes (${token.substring(0, 10)}...)` : 'No');
  console.log('🔑 User from localStorage:', getCurrentUser()?.email);
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
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
    const res = await request('/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials)
    });
    
    // Save user data to localStorage (token is in cookies)
    if (res && res.data) {
      localStorage.setItem('user', JSON.stringify(res.data));
    } else if (res && res.user) {
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return res;
  },

  register: async (payload) => {
    const res = await request('/users/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    
    if (res && res.data) {
      localStorage.setItem('user', JSON.stringify(res.data));
    } else if (res && res.user) {
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return res;
  },

  verifyResetCode: async (email, code) => {
    return request('/users/verify-reset-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, code })
    });
  },

  forgotPassword: async (email) => {
    return request('/users/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email })
    });
  },

  resetPassword: async (email, code, password) => {
    return request('/users/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, code, password })
    });
  },

  logout: async () => {
    const res = await request('/users/logout', {
      method: 'POST',
      credentials: 'include'
    });
    
    localStorage.removeItem('user');
    return res;
  },

  getProfile: async () => {
    return request('/users/me', {
      headers: authHeaders(),
      credentials: 'include'
    });
  },

  updateProfile: async (profileData) => {
    return request('/users/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      credentials: 'include',
      body: JSON.stringify(profileData)
    });
  },

  changePassword: async (currentPassword, newPassword) => {
    return request('/users/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  checkAuth: async () => {
    try {
      console.log('🔐 Checking auth with headers:', authHeaders());
      const response = await request('/users/check-auth', {
        method: 'GET',
        credentials: 'include', // Important for cookies
        headers: authHeaders()
      });
      console.log('✅ Check auth response:', response);
      return response;
    } catch (error) {
      console.error('❌ Check auth error:', error);
      throw error;
    }
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


  deleteUser: async (userId) => {
    return request(`/users/${userId}`, {
      method: 'DELETE',
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
  forgotPassword: userAPI.forgotPassword,
  resetPassword: userAPI.resetPassword,
  logout: userAPI.logout,
  getProfile: userAPI.getProfile,
  updateProfile: userAPI.updateProfile,
  changePassword: userAPI.changePassword,
  checkAuth: userAPI.checkAuth
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
      headers: authHeaders(),
      credentials: 'include'
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

  uploadOrderProof: async (orderId, formData) => {
    // For FormData, let the request function handle headers properly
    // It will detect FormData and not override Content-Type
    return request(`/orders/${orderId}/upload-proof`, {
      method: 'POST',
      body: formData
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