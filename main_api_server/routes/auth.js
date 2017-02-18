// SOURCE: http://thejackalofjavascript.com/architecting-a-restful-node-js-app/
var jwt = require('jwt-simple');
var logger = require('morgan');

// just testing..
var allowed_usernames = {'admni':'padme', 'stanfoo':'stanbar'}
 
var auth = {
 
  login: function(req, res) { 
    var username = req.body.username || '';
    var password = req.body.password || '';

    console.log('username:' + username);
 
    if (username == '' || password == '') {
      // simple check to see if fields are empty - this should also be done at the frontend
	  res.status(401);
      res.json({
        "status": 401,
        "message": "Invalid credentials"
      });
      return;
    }
 
    // Fire a query to your DB and check if the credentials are valid
    var dbUserObj = auth.validate(username, password);
   
    if (!dbUserObj) { // If authentication fails, we send a 401 back
      // TODO: Query a database to see if this works
      res.status(401);
      res.json({
        "status": 401,
        "message": "Invalid credentials"
      });
      return;
    }
 
    if (dbUserObj) {
 
      // If authentication is success, we will generate a token
      // and dispatch it to the client
 
      res.json(genToken(dbUserObj));
    }
 
  },
 
  validate: function(username, password) {
    // spoofing the DB response for simplicity
    var dbUserObj = { // spoofing a userobject from the DB. 
      name: 'stanfordkid',
      role: 'admin',
      username: 'arvind@myapp.com'
    };
 
    return dbUserObj;
  },
 
  validateUser: function(username) {
    // spoofing the DB response for simplicity
    var dbUserObj = { // spoofing a userobject from the DB. 
      name: 'stanfordkid',
      role: 'admin',
      username: 'stan@ford.com'
    };
 
    return dbUserObj;
  },
}
 
// private method
function genToken(user) {
  var expires = expiresIn(1); // 1 day
  var token = jwt.encode({
    exp: expires
  }, require('../config/secret')());
 
  return {
    token: token,
    expires: expires,
    user: user
  };
}
 
function expiresIn(numDays) {
  var dateObj = new Date();
  return dateObj.setDate(dateObj.getDate() + numDays);
}
 
module.exports = auth;