const userModel = require("../models/User");
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

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
    delete userResponse.resetToken;
    delete userResponse.resetTokenExpires;
    
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
            error: err.message
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

  try {
    const user = await userModel.findOne({ email: emailValue });
    
    if (!user) {
      return res.status(404).json({ message: "Email is not registered", status: false });
    }
    
    // Generate reset token (JWT that expires in 1 hour)
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Save token to user model
    user.resetToken = resetToken;
    user.resetTokenExpires = expiry;
    await user.save();

    // Get frontend URL from environment or use default
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    try {
      // Send email using Resend
      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Estarr BookArts <noreply@yourdomain.com>',
        to: email,
        subject: 'Password Reset Request',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; line-height: 1.6;">
            <div style="max-width: 560px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #06b6d4, #3b82f6); padding: 32px 24px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Estarr BookArts</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">Password Reset Request</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 32px;">
                <p style="color: #1f2937; font-size: 18px; margin-top: 0;">Hello,</p>
                <p style="color: #4b5563; font-size: 16px; margin-bottom: 24px;">
                  We received a request to reset your password for your Estarr BookArts account. Click the button below to create a new password.
                </p>
                
                <!-- Button -->
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    Reset Password →
                  </a>
                </div>
                
                <!-- Fallback Link -->
                <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 24px 0; text-align: center;">
                  <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">
                    If the button doesn't work, copy and paste this link into your browser:
                  </p>
                  <p style="color: #3b82f6; font-size: 12px; word-break: break-all; margin: 0; font-family: monospace;">
                    ${resetLink}
                  </p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin: 24px 0 0 0;">
                  This link will expire in <strong>1 hour</strong>.
                </p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0 24px;">
                
                <p style="color: #9ca3af; font-size: 13px; margin: 0; text-align: center;">
                  If you didn't request this, please ignore this email. Your password won't change unless you click the link above.
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} Estarr BookArts. All rights reserved.
                </p>
                <p style="color: #9ca3af; font-size: 11px; margin: 8px 0 0;">
                  Your trusted bookstore in Nigeria
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      if (error) {
        console.error("Resend email error:", error);
        return res.status(500).json({ 
          status: false,
          message: "Failed to send reset email",
          error: error.message 
        });
      }

      console.log("Reset link email sent successfully:", data);
    } catch (emailErr) {
      console.error("Error sending email with Resend:", emailErr);
      return res.status(500).json({ 
        status: false,
        message: "Failed to send reset email",
        error: emailErr.message 
      });
    }

    res.status(200).json({
      status: true,
      message: "Password reset link sent to email",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ 
      status: false,
      message: "Server error",
      error: err.message 
    });
  }
}

// Verify reset token
const verifyResetToken = async (req, res) => {
  const { token, email } = req.query;

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user with matching token and not expired
    const user = await userModel.findOne({ 
      email: email || decoded.email,
      resetToken: token,
      resetTokenExpires: { $gt: new Date() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        status: false,
        message: 'Invalid or expired reset link. Please request a new one.' 
      });
    }
    
    return res.status(200).json({ 
      status: true,
      message: 'Token is valid',
      email: user.email
    });
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(400).json({ 
      status: false,
      message: 'Invalid or expired reset link. Please request a new one.' 
    });
  }
}

// Reset password with token
const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user with matching token and not expired
    const user = await userModel.findOne({ 
      email: email || decoded.email,
      resetToken: token,
      resetTokenExpires: { $gt: new Date() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        status: false,
        message: 'Invalid or expired reset link. Please request a new one.' 
      });
    }

    // Update password
    user.password = password;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    return res.status(200).json({ 
      status: true,
      message: 'Password reset successfully' 
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(400).json({ 
      status: false,
      message: 'Invalid or expired reset link. Please request a new one.' 
    });
  }
};

// Add this function to user.controller.js
const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Make sure to include all fields including phonenumber
    const user = await userModel.findById(userId).select('-password -resetToken -resetTokenExpires');
    
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
      .select('-password -resetToken -resetTokenExpires')
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
    ).select('-password -resetToken -resetTokenExpires');

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

// Optional: Add a function to send a test email
const sendTestEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Estarr BookArts <noreply@yourdomain.com>',
      to: email || 'test@example.com',
      subject: 'Test Email from Estarr BookArts',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Test Email</h1>
          <p>This is a test email to confirm Resend is working properly.</p>
          <p>Best regards,<br>Estarr BookArts Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Test email error:', error);
      return res.status(500).json({ 
        status: false, 
        message: 'Failed to send test email',
        error: error.message 
      });
    }

    res.status(200).json({
      status: true,
      message: 'Test email sent successfully',
      data
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
};

module.exports = {
  userSignUp,
  userLogin,
  updateProfile,
  changePassword,
  ForgotPassword,
  verifyResetToken,
  resetPassword,
  getMe,
  getAllUsers,
  updateUser,
  updateUserRole,
  deleteUser,
  sendTestEmail
};