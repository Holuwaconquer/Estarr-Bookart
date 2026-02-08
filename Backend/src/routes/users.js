const express = require('express');
const { 
  userLogin, 
  userSignUp, 
  getMe,
  ForgotPassword, 
  VerifyCode, 
  resetPasswordWithCode,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUser,
  deleteUser
} = require('../controllers/user.controller');
const { authenticateToken } = require('../controllers/check-auth');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// Public routes
router.post('/signup', userSignUp);
router.post('/login', userLogin);
router.post('/forgot-password', ForgotPassword);
router.post('/verify-reset-code', VerifyCode);
router.post('/reset-password', resetPasswordWithCode);

// Protected routes
router.get('/check-auth', authenticateToken, (req, res) => {
  // Ensure user object includes role
  const userData = {
    ...req.user.toObject ? req.user.toObject() : req.user,
    role: req.user.role
  };
  res.status(200).json({ authenticated: true, user: userData, role: userData.role });
});

// Admin routes
router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

router.get('/me', authenticateToken, getMe);
router.put('/me', authenticateToken, updateProfile);
router.post('/change-password', authenticateToken, changePassword);

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict'
  });
  res.status(200).json({ message: 'Logged out' });
});

module.exports = router;