const jwt = require('jsonwebtoken');
const userModel = require("../models/User");

const authenticateToken = async (req, res, next) => {
  try {
    // Get token from various sources
    let token;
    
    // 1. Check cookies first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Check Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 3. Check query parameter
    else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ 
        authenticated: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded in check-auth:', { userId: decoded.userId, id: decoded.id, email: decoded.email, role: decoded.role });
    
    // Find user in database - try userId first, then id
    const userId = decoded.userId || decoded.id;
    console.log('🔍 Looking up user with ID:', userId);
    
    const user = await userModel.findById(userId).select('-password');
    
    if (!user) {
      console.error('❌ User not found with ID:', userId);
      return res.status(401).json({ 
        authenticated: false, 
        message: 'User not found.' 
      });
    }

    console.log('✅ User found:', { email: user.email, role: user.role });

    // Attach user to request object with role
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        authenticated: false, 
        message: 'Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        authenticated: false, 
        message: 'Token has expired.' 
      });
    }
    
    res.status(500).json({ 
      authenticated: false, 
      message: 'Server error during authentication.' 
    });
  }
};

module.exports = {
  authenticateToken
};