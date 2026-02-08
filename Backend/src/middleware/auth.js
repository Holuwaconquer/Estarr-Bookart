const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/apiResponse');

// @desc    Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.warn('⚠️ No token provided');
      return ApiResponse.error(res, 'Not authorized, no token', 401);
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token decoded:', { userId: decoded.userId, email: decoded.email, role: decoded.role });
      
      // Add user info to request
      req.userId = decoded.userId;
      req.userRole = decoded.role;
      req.userEmail = decoded.email;
      
      console.log('✅ Protection middleware passed, user role:', req.userRole);
      next();
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      return ApiResponse.error(res, 'Not authorized, invalid token', 401);
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    next(error);
  }
};

// @desc    Authorize admin routes
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log('🔐 Authorization check:', { requiredRoles: roles, userRole: req.userRole, userId: req.userId });
    
    if (!req.userRole) {
      console.warn('⚠️ User role is undefined');
      return ApiResponse.error(res, 'User role is not defined. Please login again.', 403);
    }
    
    if (!roles.includes(req.userRole)) {
      console.warn(`⚠️ Unauthorized: User role "${req.userRole}" not in allowed roles:`, roles);
      return ApiResponse.error(res, `Role ${req.userRole} is not authorized to access this route`, 403);
    }
    
    console.log('✅ Authorization passed');
    next();
  };
};