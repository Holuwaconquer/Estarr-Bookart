const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth');

// Admin-only routes
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, authorize('admin'), getUserById);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.patch('/:id/role', protect, authorize('admin'), updateUserRole);

module.exports = router;
