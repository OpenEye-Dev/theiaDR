// custom user schema and methods on it for creating and checking against password hash
var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

const TOKENTIME = 12 * 60 * 60; // in seconds

var userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  hashedPassword: String,
  salt: String
});

userSchema.methods.setPassword = function(password){
  // TODO: For some reason when 'password' is alphanumeric, the system hangs
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hashedPassword = crypto.pbkdf2Sync(password, new Buffer(this.salt, 'binary'), 1000, 64, 'sha1', function(err){ console.error(err)}).toString('hex');
};

userSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, new Buffer(this.salt, 'binary'), 1000, 64, 'sha1', function(err){ console.error(err)}).toString('hex');
  return this.hashedPassword === hash;
};

userSchema.methods.generateJwt = function() {
  return jwt.sign({
    _id: this._id
  }, "MY_SECRET", {
    expiresIn: TOKENTIME
  }); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

mongoose.model('User', userSchema);