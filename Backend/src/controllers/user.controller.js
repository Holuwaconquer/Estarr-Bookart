const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password -resetPasswordToken');
    res.status(200).json({
      status: 'success',
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch users'
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -resetPasswordToken');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch user'
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const allowedFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'country', 'role'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update user'
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete user'
    });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role. Must be "user" or "admin"'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update user role'
    });
  }
};
