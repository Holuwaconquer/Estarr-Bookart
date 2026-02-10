const userModel = require("../models/User");
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');

const userSignUp = async (req, res) => {
  const { name, email, password, phonenumber } = req.body;

  try {
    const user = new userModel({ name, email, phonenumber, password });
    await user.save();
    
    if (!user) {
      console.log('user cannot be save');
      return res.status(404).json({ message: 'user cannot be save' });
    }
    
    console.log('user has been saved');
    res.status(201).json({ message: 'user has successfully been saved', status: true, user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Duplicate field: email already exists" });
    }
    console.log('there is an error saving user in catch block', err);
    return res.status(500).json({ message: 'server error' });
  }
}

const userLogin = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await userModel.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(404).json({ message: 'User email cannot be found' });
    }
    
    return new Promise((resolve, reject) => {
      user.validatePassword(password, (err, isMatch) => {
        if (err) {
          console.error('Password validation error:', err);
          return res.status(500).json({ error: 'Error validating password', details: err.message });
        }
        
        if (!isMatch) {
          return res.status(401).json({ message: 'Password is incorrect' });
        }

        const token = jwt.sign(
          { userId: user._id, id: user._id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '10h' }
        );

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        // Add phone field for frontend compatibility
        userResponse.phone = userResponse.phonenumber;
        userResponse.name = `${userResponse.firstname || ''} ${userResponse.lastname || ''}`.trim();

        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict',
          maxAge: 10 * 60 * 60 * 1000
        });
        
        // Return token in response body too
        res.status(200).json({
          status: true,
          message: 'User login successfully',
          data: {
            ...userResponse,
            token: token
          },
        });
        
        resolve();
      });
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'server error' });
  }
}

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address, city, country, bio, state, zipCode } = req.body;

    // Find user by ID
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    if (name) {
      const nameParts = name.split(' ');
      user.firstname = nameParts[0] || user.firstname;
      user.lastname = nameParts.slice(1).join(' ') || user.lastname;
    }
    
    if (phone !== undefined) user.phonenumber = phone;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (country !== undefined) user.country = country;
    if (bio !== undefined) user.bio = bio;
    if (state !== undefined) user.state = state;
    if (zipCode !== undefined) user.zipCode = zipCode;

    // Save updated user
    await user.save();

    // Return updated user without sensitive information
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.resetCode;
    delete userResponse.resetCodeExpires;
    
    // Add phone and name fields for frontend compatibility
    userResponse.phone = userResponse.phonenumber;
    userResponse.name = `${userResponse.firstname || ''} ${userResponse.lastname || ''}`.trim();

    res.status(200).json({
      status: true,
      message: 'Profile updated successfully',
      data: userResponse
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        status: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    // Find user WITH password field explicitly selected
    const user = await userModel.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    // Check if user has a password (in case they signed up via social login)
    if (!user.password) {
      return res.status(400).json({
        status: false,
        message: 'Password not set for this account. Please use password reset instead.'
      });
    }

    // Verify current password
    return new Promise((resolve, reject) => {
      user.validatePassword(currentPassword, async (err, isMatch) => {
        if (err) {
          console.error('Password validation error:', err);
          return res.status(500).json({
            status: false,
            message: 'Error validating password',
            error: err.message // Include error message for debugging
          });
        }

        if (!isMatch) {
          return res.status(401).json({
            status: false,
            message: 'Current password is incorrect'
          });
        }

        try {
          // Update password
          user.password = newPassword;
          await user.save();

          // Return success response
          res.status(200).json({
            status: true,
            success: true,
            message: 'Password changed successfully'
          });
        } catch (saveError) {
          console.error('Error saving new password:', saveError);
          res.status(500).json({
            status: false,
            message: 'Error updating password',
            error: saveError.message
          });
        }
      });
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({
      status: false,
      message: 'Server error',
      error: err.message
    });
  }
};

const ForgotPassword = async (req, res) => {
  const { email } = req.body;

  let emailValue = email;

  if (typeof emailValue === 'string' && emailValue.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(emailValue);
      emailValue = parsed.email || parsed.value || emailValue;
    } catch (e) {
      console.log('Failed to parse email as JSON:', e.message);
    }
  }

  if (typeof emailValue === 'object' && emailValue !== null) {
    if (typeof emailValue.email === 'string') emailValue = emailValue.email;
    else if (typeof emailValue.value === 'string') emailValue = emailValue.value;
  }

  console.log('Final email value after normalization:', emailValue);
  console.log('Type of emailValue:', typeof emailValue);

  try {
    const user = await userModel.findOne({ email: emailValue });
    console.log('ForgotPassword payload:', req.body, 'using email:', emailValue);
    
    if (!user) {
      console.log("No user find with the email");
      return res.status(404).json({ message: "Email is not registered", status: false });
    }
    
    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000);
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    
    // Save code to user model
    user.resetCode = code.toString();
    user.resetCodeExpires = expiry;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS_TO_SEND_CODE,
        pass: process.env.PASSWORD_TO_EMAIL_ADDRESS_TO_SEND_CODE
      }
    });

    const mailOptions = {
      from: `"Estarr BookArts" <${process.env.EMAIL_ADDRESS_TO_SEND_CODE}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Use this code to reset your password: <strong>${code}</strong></p>
           <p>This code will expire in 15 minutes.</p>`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailErr) {
      console.error("Error sending email:", emailErr);
      return res.status(500).json({ message: "Failed to send reset email" });
    }

    res.status(200).json({
      status: true,
      message: "Reset code sent to email",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

const VerifyCode = async (req, res) => {
  const { email, code } = req.body;

  const user = await userModel.findOne({ email });
  
  if (!user || !user.resetCode || !user.resetCodeExpires) {
    return res.status(400).json({ message: 'Invalid request' });
  }
  
  if (user.resetCode !== code) {
    return res.status(404).json({ message: 'Invalid code' });
  }
  
  if (user.resetCodeExpires < new Date()) {
    return res.status(400).json({ message: 'Code has expired' });
  }
  
  return res.status(200).json({ message: 'Code verified', status: true });
}

const resetPasswordWithCode = async (req, res) => {
  const { email, code, password } = req.body;

  const user = await userModel.findOne({ email });
  
  if (!user || user.resetCode !== code || user.resetCodeExpires < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired code' });
  }

  user.password = password;
  user.resetCode = null;
  user.resetCodeExpires = null;

  await user.save();

  return res.status(200).json({ message: 'Password reset successfully' });
};

// Add this function to user.controller.js
const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Make sure to include all fields including phonenumber
    const user = await userModel.findById(userId).select('-password -resetCode -resetCodeExpires');
    
    if (!user) {
      return res.status(404).json({ 
        status: false,
        message: 'User not found' 
      });
    }

    // Convert to object and add phone field for frontend compatibility
    const userResponse = user.toObject();
    
    // Ensure phone field exists for frontend
    userResponse.phone = userResponse.phonenumber;
    
    // Ensure name field is properly formatted
    userResponse.name = `${userResponse.firstname || ''} ${userResponse.lastname || ''}`.trim() || userResponse.name;

    res.status(200).json({
      status: true,
      message: 'User profile retrieved successfully',
      data: userResponse
    });
  } catch (err) {
    console.error('Error getting user profile:', err);
    res.status(500).json({ 
      status: false,
      message: 'Server error' 
    });
  }
};

// @desc    Update a user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, city, state, zipCode, country, role } = req.body;

    console.log('📝 Updating user:', { id, ...req.body });

    // Validate role if provided
    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid role. Must be "user" or "admin"'
      });
    }

    // Find user and update
    const user = await userModel.findByIdAndUpdate(
      id,
      {
        firstname: name ? name.split(' ')[0] : undefined,
        lastname: name ? name.split(' ').slice(1).join(' ') : undefined,
        email,
        phonenumber: phone,
        address,
        city,
        state,
        zipCode,
        country,
        ...(role && { role })
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    console.log('✅ User updated:', user._id);

    res.status(200).json({
      status: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('❌ Error updating user:', error);
    res.status(500).json({
      status: false,
      message: 'Server error while updating user'
    });
  }
};


// @desc    Delete a user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Deleting user:', id);

    const user = await userModel.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    console.log('✅ User deleted:', id);

    res.status(200).json({
      status: true,
      message: 'User deleted successfully',
      data: { deletedId: id }
    });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({
      status: false,
      message: 'Server error while deleting user'
    });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    console.log('\n========== getAllUsers START ==========');
    console.log('📝 Request query:', req.query);
    
    const { limit = 50, page = 1, search = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { email: { $regex: search, $options: 'i' } },
          { firstname: { $regex: search, $options: 'i' } },
          { lastname: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await userModel
      .find(query)
      .select('-password')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await userModel.countDocuments(query);

    console.log('👥 Users found:', users.length, 'Total:', total);

    const responseData = {
      status: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    };
    
    console.log('Response structure:', {
      status: responseData.status,
      message: responseData.message,
      dataKeys: Object.keys(responseData.data),
      usersCount: responseData.data.users.length,
      pagination: responseData.data.pages
    });
    console.log('========== getAllUsers END ==========\n');

    res.status(200).json(responseData);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      status: false,
      message: 'Server error while fetching users'
    });
  }
};

// @desc    Update user role (Admin only)
// @route   PATCH /api/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid role. Must be "user" or "admin"'
      });
    }

    console.log(`🔐 Updating user role: ${id} -> ${role}`);

    const user = await userModel.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    console.log('✅ User role updated:', user._id, 'Role:', user.role);

    res.status(200).json({
      status: true,
      message: `User role updated to ${role}`,
      data: user
    });
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    res.status(500).json({
      status: false,
      message: 'Server error while updating user role'
    });
  }
};

module.exports = {
  userSignUp,
  userLogin,
  updateProfile,
  changePassword,
  ForgotPassword,
  VerifyCode,
  resetPasswordWithCode,
  getMe,
  getAllUsers,
  updateUser,
  updateUserRole,
  deleteUser
};