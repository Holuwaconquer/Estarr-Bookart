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
      return ApiResponse.error(res, 'Not authorized, no token', 401);
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Add user info to request
      req.userId = decoded.userId;
      req.userRole = decoded.role;
      
      next();
    } catch (error) {
      return ApiResponse.error(res, 'Not authorized, invalid token', 401);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authorize admin routes
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return ApiResponse.error(res, `Role ${req.userRole} is not authorized to access this route`, 403);
    }
    next();
  };
};