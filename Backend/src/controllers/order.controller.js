const Order = require('../models/Order');
const Book = require('../models/Book');
const ApiResponse = require('../utils/apiResponse');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, shippingFee: incomingShippingFee } = req.body;
    const userId = req.userId;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return ApiResponse.error(res, 'Order must contain at least one item', 400);
    }

    // Fetch book details and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const book = await Book.findById(item.book);
      
      if (!book) {
        return ApiResponse.error(res, `Book not found: ${item.book}`, 404);
      }

      if (book.stock < item.quantity) {
        return ApiResponse.error(res, `Insufficient stock for: ${book.title}`, 400);
      }

      const price = book.discount > 0 ? book.finalPrice : book.price;
      const itemTotal = price * item.quantity;
      
      orderItems.push({
        book: book._id,
        title: book.title,
        author: book.author,
        image: book.image,
        price: price,
        quantity: item.quantity,
        edition: book.edition
      });

      subtotal += itemTotal;
      
      // Reduce stock
      book.stock -= item.quantity;
      await book.save();
    }

    // Calculate totals - use frontend shipping fee if provided, otherwise calculate
    const shippingFee = incomingShippingFee !== undefined && incomingShippingFee !== null 
      ? Number(incomingShippingFee) 
      : (subtotal > 100 ? 0 : 9.99); // Fallback to old logic
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + shippingFee + tax;

    console.log('📦 Order creation - Shipping fee:', { 
      incoming: incomingShippingFee, 
      used: shippingFee, 
      subtotal, 
      total 
    });

    // Create order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingFee,
      tax,
      total,
      status: 'pending',
      paymentStatus: 'pending'
    });

    return ApiResponse.success(res, 'Order created successfully', order, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .sort('-createdAt')
      .populate('items.book', 'title author image')
      .select('-__v');

    return ApiResponse.success(res, 'Orders retrieved successfully', orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.book', 'title author image price')
      .select('-__v');

    if (!order) {
      return ApiResponse.error(res, 'Order not found', 404);
    }

    // Check if user owns the order or is admin
    if (order.user.toString() !== req.userId && req.userRole !== 'admin') {
      return ApiResponse.error(res, 'Not authorized', 403);
    }

    return ApiResponse.success(res, 'Order retrieved successfully', order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    console.log('\n========== getAllOrders START ==========');
    console.log('📦 getAllOrders called:', { userId: req.userId, userRole: req.userRole });
    console.log('Full req.query:', JSON.stringify(req.query));
    
    const { page = 1, limit = 20, status } = req.query;
    
    console.log('Extracted params:', { page, limit, status });
    console.log('Param types:', { pageType: typeof page, limitType: typeof limit, statusType: typeof status });
    
    const query = {};
    if (status && status !== 'undefined' && status !== undefined) {
      query.status = status;
      console.log('Status filter applied:', status);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    console.log('Computed values:', { pageNum, limitNum, skip });

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .populate('user', 'name email')
        .select('-__v'),
      Order.countDocuments(query)
    ]);

    console.log('📊 Database result:', { ordersLength: orders.length, total });
    console.log('✅ Orders found:', orders.length, 'Total:', total);
    
    const responseData = {
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    };

    console.log('Response structure:', {
      ordersCount: responseData.orders.length,
      pagination: responseData.pagination
    });

    const result = ApiResponse.success(res, 'Orders retrieved successfully', responseData);
    console.log('========== getAllOrders END ==========\n');
    return result;
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    console.error('Stack:', error.stack);
    next(error);
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    if (!['received', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return ApiResponse.error(res, 'Invalid status', 400);
    }

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return ApiResponse.error(res, 'Order not found', 404);
    }

    order.status = status;
    if (adminNotes) {
      order.adminNotes = adminNotes;
    }
    await order.save();

    return ApiResponse.success(res, 'Order status updated successfully', order);
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment-status
// @access  Private
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, paymentId } = req.body;

    if (!['pending', 'processing', 'completed', 'failed', 'refunded'].includes(paymentStatus)) {
      return ApiResponse.error(res, 'Invalid payment status', 400);
    }

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return ApiResponse.error(res, 'Order not found', 404);
    }

    // Check if user owns the order or is admin
    if (order.user.toString() !== req.userId && req.userRole !== 'admin') {
      return ApiResponse.error(res, 'Not authorized', 403);
    }

    order.paymentStatus = paymentStatus;
    if (paymentId) order.paymentId = paymentId;
    await order.save();

    return ApiResponse.success(res, 'Payment status updated successfully', order);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return ApiResponse.error(res, 'Order not found', 404);
    }

    // Check if user owns the order
    if (order.user.toString() !== req.userId) {
      return ApiResponse.error(res, 'Not authorized', 403);
    }

    // Check if order can be cancelled
    if (!['received', 'processing'].includes(order.status)) {
      return ApiResponse.error(res, 'Order cannot be cancelled at this stage', 400);
    }

    // Restore stock
    for (const item of order.items) {
      const book = await Book.findById(item.book);
      if (book) {
        book.stock += item.quantity;
        await book.save();
      }
    }

    order.status = 'cancelled';
    order.cancellationReason = req.body.reason || 'Cancelled by user';
    await order.save();

    return ApiResponse.success(res, 'Order cancelled successfully', order);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin cancel order
// @route   PUT /api/orders/:id/admin-cancel
// @access  Private/Admin
exports.adminCancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return ApiResponse.error(res, 'Order not found', 404);
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      return ApiResponse.error(res, 'Order cannot be cancelled at this stage', 400);
    }

    // Restore stock
    for (const item of order.items) {
      const book = await Book.findById(item.book);
      if (book) {
        book.stock += item.quantity;
        await book.save();
      }
    }

    order.status = 'cancelled';
    order.cancellationReason = reason || 'Cancelled by admin';
    order.adminNotes = `Cancelled by admin - ${reason || 'No reason provided'}`;
    await order.save();

    return ApiResponse.success(res, 'Order cancelled successfully', order);
  } catch (error) {
    next(error);
  }
};

// @desc    Request refund
// @route   POST /api/orders/:id/request-refund
// @access  Private
exports.requestRefund = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return ApiResponse.error(res, 'Order not found', 404);
    }

    // Check if user owns the order
    if (order.user.toString() !== req.userId) {
      return ApiResponse.error(res, 'Not authorized', 403);
    }

    // Check if order can be refunded
    if (!['received', 'processing', 'shipped', 'cancelled'].includes(order.status)) {
      return ApiResponse.error(res, 'Order cannot be refunded at this stage', 400);
    }

    order.refundRequested = true;
    await order.save();

    return ApiResponse.success(res, 'Refund requested successfully. Admin will review and process.', order);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve refund (Admin)
// @route   PUT /api/orders/:id/approve-refund
// @access  Private/Admin
exports.approveRefund = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return ApiResponse.error(res, 'Order not found', 404);
    }

    if (!order.refundRequested) {
      return ApiResponse.error(res, 'No refund request for this order', 400);
    }

    order.refundApproved = true;
    order.paymentStatus = 'refunded';
    await order.save();

    return ApiResponse.success(res, 'Refund approved successfully', order);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload proof of payment for an order
// @route   POST /api/orders/:id/upload-proof
// @access  Private
exports.uploadOrderProof = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log('📤 Upload proof request:', { orderId: id, userId, file: req.file?.filename });

    // Check if file is provided
    if (!req.file) {
      console.error('❌ No file provided in upload');
      return ApiResponse.error(res, 'No file provided', 400);
    }

    const order = await Order.findById(id);
    if (!order) {
      console.error('❌ Order not found:', id);
      return ApiResponse.error(res, 'Order not found', 404);
    }

    // Check if user is owner of order
    if (order.user.toString() !== userId) {
      console.error('❌ Unauthorized: User mismatch', { orderUser: order.user.toString(), userId });
      return ApiResponse.error(res, 'Unauthorized', 403);
    }

    // Construct the file URL - will be accessible at /uploads/payments/filename
    const fileName = req.file.filename;
    const proofUrl = `/uploads/payments/${fileName}`;

    order.proofOfPayment = proofUrl;
    order.paymentStatus = 'processing'; // Update status to show proof is received
    await order.save();

    console.log('✅ Proof of payment uploaded for order:', { orderId: id, proofUrl, fileName });

    return ApiResponse.success(res, 'Proof of payment uploaded successfully', order);
  } catch (error) {
    console.error('❌ Error uploading proof:', error);
    next(error);
  }
};

// @desc    Get proof of payment for an order
// @route   GET /api/orders/:id/proof
// @access  Private
exports.getOrderProof = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).select('proofOfPayment user');

    if (!order) {
      return ApiResponse.error(res, 'Order not found', 404);
    }

    // Check authorization
    if (order.user.toString() !== req.userId && req.userRole !== 'admin') {
      return ApiResponse.error(res, 'Not authorized', 403);
    }

    if (!order.proofOfPayment) {
      return ApiResponse.error(res, 'No proof of payment found', 404);
    }

    // Extract filename from the path
    const fileName = order.proofOfPayment.split('/').pop();
    const filePath = `public/uploads/payments/${fileName}`;

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return ApiResponse.error(res, 'Proof file not found', 404);
    }

    // Send the file
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(filePath, { root: process.cwd() });
  } catch (error) {
    console.error('❌ Error getting proof:', error);
    next(error);
  }
};