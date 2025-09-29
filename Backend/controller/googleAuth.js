const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken')
const userModel = require('../model/user.model')
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const googleAuth = async (req, res) => {
  const { idToken } = req.body

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const { email, given_name, family_name } = payload

    let user = await userModel.findOne({ email })

    if (!user) {
      user = new userModel({
        firstname: given_name,
        lastname: family_name,
        email,
        authProvider: 'google',
      })
      await user.save()
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '10h' })

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 10 * 60 * 60 * 1000,
    })

    const { password, ...userData } = user._doc
    return res.status(200).json({ status: true, user: userData })
  } catch (error) {
    console.error('[Google OAuth Error]', error.message || error)
    return res.status(401).json({ status: false, message: 'Invalid Google Token' })
  }
}

module.exports = {
  googleAuth
}