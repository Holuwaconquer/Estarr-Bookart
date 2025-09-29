const express = require('express');
const { userLogin, userSignUp, ForgotPassword, VerifyCode, resetPasswordWithCode } = require('../controller/user.controller');
const { authenticateToken } = require('../controller/check-auth');
const { googleAuth } = require('../controller/googleAuth');
const { facebookAuth } = require('../controller/facebookAuth');
const router = express.Router();


router.post('/signup', userSignUp);
router.post('/login', userLogin);
router.get('/check-auth', authenticateToken, (req, res)=>{
    res.status(200).json({ authenticated: true, user: req.user})
})
router.post('/logout', (req, res) =>{
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    });
    res.status(200).json({ message: 'Logged out' })
})
router.post('/google-auth', googleAuth)
router.post('/facebook-auth', facebookAuth)
router.post('/forgot-password', ForgotPassword)
router.post('/verify-reset-code', VerifyCode)
router.post('/reset-password', resetPasswordWithCode)

module.exports = router;