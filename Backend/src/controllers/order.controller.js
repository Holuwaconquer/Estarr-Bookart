const Order = require('../models/Order');
const Book = require('../models/Book');
const ApiResponse = require('../utils/apiResponse');
const cloudinary = require('../config/cloudinary');
const { sendOrderNotificationEmail, sendOrderConfirmationEmail } = require('../services/emailService');
const User = require('../models/User');

// Helper function to upload file to Cloudinary
const uploadToCloudinary = async (file, folder = 'order-proofs') => {
  // Convert buffer to base64 for Cloudinary upload
  const base64String = file.buffer.toString('base64');
  const dataURI = `data:${file.mimetype};base64,${base64String}`;
  
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: folder,
    resource_type: 'auto', // Auto-detect file type (image, pdf, etc.)
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf']
  });
  
  return {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    size: result.bytes,
    originalName: file.originalname
  };
};

// Helper function to delete from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log('✅ Deleted from Cloudinary:', publicId);
  } catch (error) {
    console.error('❌ Error deleting from Cloudinary:', error);
  }
};

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
      : (subtotal > 100 ? 0 : 9.99);
    const total = subtotal + shippingFee;

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
      total,
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Fetch user details for email
    const user = await User.findById(userId).select('name email phonenumber');

    // Send admin notification (don't await - send in background)
    sendOrderNotificationEmail(order, user).catch(err => {
      console.error('Background admin notification error:', err);
    });

    // Send order confirmation to customer (don't await - send in background)
    sendOrderConfirmationEmail(order, user).catch(err => {
      console.error('Background order confirmation error:', err);
    });

    return ApiResponse.success(res, 'Order created successfully', order, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload proof of payment for an order to Cloudinary
// @route   POST /api/orders/:id/upload-proof
// @access  Private
exports.uploadOrderProof = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log('📤 Upload proof request:', { orderId: id, userId, file: req.file?.originalname });

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

    // Delete old proof from Cloudinary if exists
    if (order.proofOfPaymentPublicId) {
      await deleteFromCloudinary(order.proofOfPaymentPublicId);
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file, 'order-proofs');
    
    console.log('✅ Uploaded to Cloudinary:', uploadResult);

    // Store both URL and public ID for future deletion
    order.proofOfPayment = uploadResult.url;
    order.proofOfPaymentPublicId = uploadResult.publicId;
    order.proofOfPaymentMetadata = {
      format: uploadResult.format,
      size: uploadResult.size,
      originalName: uploadResult.originalName,
      uploadedAt: new Date()
    };
    order.paymentStatus = 'processing'; // Update status to show proof is received
    await order.save();

    console.log('✅ Proof of payment uploaded for order:', { orderId: id, proofUrl: uploadResult.url });

    return ApiResponse.success(res, 'Proof of payment uploaded successfully', order);
  } catch (error) {
    console.error('❌ Error uploading proof:', error);
    next(error);
  }
};

// @desc    Get proof of payment for an order from Cloudinary
// @route   GET /api/orders/:id/proof
// @access  Private
exports.getOrderProof = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const isAdmin = req.userRole === 'admin';

    console.log('📥 Get proof request:', { orderId: id, userId, isAdmin });

    const order = await Order.findById(id);
    if (!order) {
      console.error('❌ Order not found:', id);
      return ApiResponse.error(res, 'Order not found', 404);
    }

    // Check authorization - user can view own proof, admin can view any
    if (!isAdmin && order.user.toString() !== userId) {
      console.error('❌ Unauthorized: User mismatch', { orderUser: order.user.toString(), userId });
      return ApiResponse.error(res, 'Unauthorized', 403);
    }

    if (!order.proofOfPayment) {
      console.error('❌ No proof found for order:', id);
      return ApiResponse.error(res, 'No proof found for this order', 404);
    }

    // Return the Cloudinary URL
    return ApiResponse.success(res, 'Proof of payment retrieved', {
      url: order.proofOfPayment,
      metadata: order.proofOfPaymentMetadata
    });
  } catch (error) {
    console.error('❌ Error getting proof:', error);
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

    if (!['pending', 'received', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
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
    if (!['pending', 'received', 'processing'].includes(order.status)) {
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

// @desc    Delete proof from Cloudinary (Admin utility)
// @route   DELETE /api/orders/:id/proof
// @access  Private/Admin
exports.deleteOrderProof = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return ApiResponse.error(res, 'Order not found', 404);
    }

    if (!order.proofOfPaymentPublicId) {
      return ApiResponse.error(res, 'No proof found for this order', 404);
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(order.proofOfPaymentPublicId);

    // Clear proof fields
    order.proofOfPayment = null;
    order.proofOfPaymentPublicId = null;
    order.proofOfPaymentMetadata = null;
    await order.save();

    return ApiResponse.success(res, 'Proof of payment deleted successfully', order);
  } catch (error) {
    console.error('❌ Error deleting proof:', error);
    next(error);
  }
};