var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

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
        var user = new User();
        user.username = req.body.username;
        user.setPassword(req.body.password);
        user.save(function(err) {
          var token;
          token = user.generateJwt();
          res.status(200);
          res.json({
            "token" : token
          });
        });
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
      token = user.generateJwt();
      res.status(200);
      res.json({
        "token" : token
      });
    } else {
      // If user is not found
      res.status(401).json(info);
    }
  })(req, res);

};