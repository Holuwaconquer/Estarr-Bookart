const axios = require('axios');
const jwt = require('jsonwebtoken');
const userModel = require('../model/user.model');

const facebookAuth = async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ status: false, message: 'Access token is required' });
  }

  try {
    // 1. Verify token and get user info from Facebook API
    const fbResponse = await axios.get(
      `https://graph.facebook.com/me`,
      {
        params: {
          fields: 'id,email,first_name,last_name',
          access_token: accessToken,
        },
      }
    );

    const { email, first_name, last_name } = fbResponse.data;

    if (!email) {
      return res.status(400).json({ status: false, message: 'Email permission is required' });
    }

    // 2. Find existing user or create new one
    let user = await userModel.findOne({ email });

    if (!user) {
      user = new userModel({
        firstname: first_name,
        lastname: last_name,
        email,
        password: 'FACEBOOK_AUTH', // dummy password since login is via Facebook
      });
      await user.save();
    }

    // 3. Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '10h' }
    );

    // 4. Set cookie with token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 10 * 60 * 60 * 1000, // 10 hours
    });

    // 5. Return user info (excluding password)
    const { password, ...userData } = user._doc;

    return res.status(200).json({ status: true, user: userData });
  } catch (error) {
    console.error('Facebook Auth error:', error.response?.data || error.message);
    return res.status(401).json({ status: false, message: 'Invalid Facebook token' });
  }
};

module.exports = {
  facebookAuth,
};
