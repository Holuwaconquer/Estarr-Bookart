const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  firstname: {type:String, required:true},
  lastname: {type:String, required:true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'facebook', 'apple'],
    default: 'local',
  },
  resetCode: String,
  resetCodeExpires: Date,
  createdAt: {type: Date, default:  Date.now}
});

const saltRound = 10;

userSchema.pre('save', function(next){
  if(!this.isModified('password')) return next();

  if (!this.password) return next();

  bcrypt.hash(this.password, saltRound, (err, hashedPassword) =>{
    if(err){
      return next(err)
    }
    this.password = hashedPassword;
    next();
  })
})

userSchema.methods.validatePassword = function(password, callback){
  if (!this.password) {
    return callback(null, false);
  }
  bcrypt.compare(password, this.password, (err, isMatch) =>{
    if(err){
      return callback(err)
    }
    if(isMatch){
      return callback(null, true)
    }else{
      return callback(null, false)
    }
  })
}

const userModel = mongoose.model('user', userSchema)

module.exports = userModel;