const userModel = require("../model/user.model");
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');

const userSignUp = async (req, res) =>{
  
  const { firstname, lastname, email, password, phonenumber } = req.body;

  try{
    const user = new userModel({firstname, lastname, email, phonenumber, password})
    await user.save()
    if(!user){
        console.log('user cannot be save');   
        return res.status(404).json({message: 'user cannot be save'})
    }
    console.log('user has been saved');
    res.status(201).json({message: 'user has successfully been saved', status: true, user})
  }catch(err){
    if (err.code === 11000) {
      return res.status(400).json({ error: "Duplicate field: email already exists" });
    }
    console.log('there is an error saving user in catch block', err);
    return res.status(500).json({message: 'server error'})
  }
}

const userLogin = async (req, res) =>{
  const { email, password } = req.body
  try{
    const user = await userModel.findOne({email})
    if(!user){
      console.log('user email is not found');
      return res.status(404).json({message: 'User email cannot be found'})
    }
    if(user){
      console.log('user email found');
      user.validatePassword(password, (err, isMatch)=>{
        if(err){
          return res.status(500).json({error: 'error validating password'});
        }
        if(!isMatch){
          return res.status(401).json({ message: 'password is incorrect'})
        }

        const token = jwt.sign(
          {id: user._id, email: user.email},
          process.env.JWT_SECRET,
          { expiresIn: '10h' }
        )

        const { password, userWithoutPassword } = user._doc;

        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict',
          maxAge: 10 * 60 * 60 * 1000
        })
        res.status(200).json({
          status: true,
          message: 'User login successfully',
          data: userWithoutPassword,
        }); 
      });
    }
  }catch(err){
    res.status(500).json({error: 'server error'})
  }
}

const ForgotPassword = async (req, res) => {
  const { email } = req.body;
  // Normalize email: sometimes frontend may send an object like { email: 'x' }
  let emailValue = email;
  if (typeof emailValue === 'object' && emailValue !== null) {
    if (typeof emailValue.email === 'string') emailValue = emailValue.email;
    else if (typeof emailValue.value === 'string') emailValue = emailValue.value;
  }

  try{
    console.log('ForgotPassword payload:', req.body, 'using email:', emailValue);
    const user = await userModel.findOne({ email: emailValue });
    if(!user){
      console.log("No user find with the email");
      return res.status(404).json({ message: "Email is not registered", status: false })
    }
    // to generate a 6 digit code to send to user email
    const code = Math.floor(100000 + Math.random() * 900000);
    // for when code will expire = 15minutes
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    // save code to user model
    user.resetCode = code.toString()
    user.resetCodeExpires = expiry
    await user.save()

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

    try{
      await transporter.sendMail(mailOptions)
    }catch(emailErr){
      console.error("Error sending email:", emailErr);
      return res.status(500).json({ message: "Failed to send reset email" });
    }

    res.status(200).json({
      status: true,
      message: "Reset code sent to email",
      // resetLink
    })
  }catch(err){
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

const VerifyCode = async (req, res) =>{
  const { email, code } = req.body;

  const user = await userModel.findOne({email})
  if(user){
    console.log('user found')
  }
  if(!user || !user.resetCode || !user.resetCodeExpires){
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


module.exports = {
    userSignUp,
    userLogin,
    ForgotPassword,
    VerifyCode,
    resetPasswordWithCode
}