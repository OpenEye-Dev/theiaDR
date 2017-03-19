// Authentication API for register and login
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var SIGNUP_CODES = ['CS193S'];    // TODO: Get from external file or database

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.register = function(req, res) {
  // TODO: Check if this username is already there in the db
  User.findOne({ username: req.body.username }, function (err, user) {
      if (err) { res.send(err); }
      // Return if user not found in database
      if (user) {
        res.json({
          message: 'User already exists'
        });
      } else {
        // check if signupCode is correct
        if (req.body.signupCode == undefined) {
          res.status(400).json({'message':'signup code missing'});
        } else {
          if (SIGNUP_CODES.indexOf(req.body.signupCode) != -1) {
            var user = new User();
            user.username = req.body.username;
            user.setPassword(req.body.password);
            user.save(function(err) {
              res.status(200);
              res.json(user.generateJwt());
            });
          } else {
            res.status(400).json({'message':'incorrect signup code'});
          } 
        }
      }
    });
};

module.exports.login = function(req, res) {
  passport.authenticate('local', function(err, user, info){
    var token;

    // If Passport throws/catches an error
    if (err) {
      res.status(404).json(err);
      return;
    }

    // If a user is found
    if(user){
      res.status(200);
      res.json(user.generateJwt());
    } else {
      // If user is not found
      res.status(401).json(info);
    }
  })(req, res);

};