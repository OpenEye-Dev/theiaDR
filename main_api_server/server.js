'use strict';
/*
 * API SERVER 1
----------------------------------------------------------------
 * Author: Dhruv Joshi
 *
 * References:
 * 1. https://scotch.io/tutorials/authenticate-a-node-js-api-with-json-web-tokens
 * 2. http://thejackalofjavascript.com/architecting-a-restful-node-js-app/
 * 3. https://www.ctl.io/developers/blog/post/build-user-authentication-with-node-js-express-passport-and-mongodb
 */

const express = require('express');

// App
const app = express();

var bodyParser  = require('body-parser');
var logger      = require('morgan');
var mongoose    = require('mongoose');
var jwt         = require('jsonwebtoken'); // used to create, sign, and verify tokens
var session     = require('express-session');
var passport    = require('passport');
var exphbs      = require('express-handlebars');
var auth        = require('./routes/auth.js');
var bcrypt      = require('bcryptjs');
var LocalStrategy = require('passport-local');

// ============== PASSPORT/LOGIN STUFF =================
// Stuff for user authentication ref [2]
var config = require('./config/mongoConfig.js'), //config file contains all tokens and other private info
    funct = require('./signinfunctions.js'); //funct file contains our helper functions for our Passport and database work

app.use(session({secret: 'supernova', saveUninitialized: true, resave: true}));
app.use(passport.initialize());
app.use(passport.session());

// Passport session setup.
passport.serializeUser(function(user, done) {
  console.log("serializing " + user.username);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  console.log("deserializing " + obj);
  done(null, obj);
});

// Use the LocalStrategy within Passport to login/"signin" users.
passport.use('local-signin', new LocalStrategy(
  {passReqToCallback : true}, //allows us to pass back the request to the callback
  function(req, username, password, done) {
    funct.localAuth(username, password)
    .then(function (user) {
      if (user) {
        console.log("LOGGED IN AS: " + user.username);
        req.session.success = 'You are successfully logged in ' + user.username + '!';
        done(null, user);
      }
      if (!user) {
        console.log("COULD NOT LOG IN");
        req.session.error = 'Could not log user in. Please try again.'; //inform user could not log them in
        done(null, user);
      }
    })
    .fail(function (err){
      console.log('There has been an error! It is => ' + err.body);
    });
  }
));
// Use the LocalStrategy within Passport to register/"signup" users.
passport.use('local-signup', new LocalStrategy(
  {passReqToCallback : true}, //allows us to pass back the request to the callback
  function(req, username, password, done) {
    funct.localReg(username, password)
    .then(function (user) {
      if (user) {
        console.log("REGISTERED: " + user.username);
        req.session.success = 'You are successfully registered and logged in ' + user.username + '!';
        done(null, user);
      }
      if (!user) {
        console.log("COULD NOT REGISTER");
        req.session.error = 'That username is already in use, please try a different one.'; //inform user could not log them in
        done(null, user);
      }
    })
    .fail(function (err){
      console.log(err.body);
    });
  }
));
// ================================================

// use body parser so we can get info from POST and/or URL parameters
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CORS headers
app.all('/*', function(req, res, next) {
  // CORS headers
  res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

// Configure express to use handlebars templates
var hbs = exphbs.create({
    defaultLayout: 'main', //we will be creating this layout shortly
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Constants
const PORT = 8080;

//===============ROUTES=================
//displays our homepage
app.get('/', function(req, res){
  res.render('home', {user: req.user});
});

//displays our signup page
app.get('/signin', function(req, res){
  res.render('signin');
});

//sends the request through our local signup strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/local-reg', passport.authenticate('local-signup', {
  successRedirect: '/',
  failureRedirect: '/signin'
  })
);

//sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/login', passport.authenticate('local-signin', {
  successRedirect: '/',
  failureRedirect: '/signin'
  })
);

//logs user out of site, deleting them from the session, and returns to homepage
app.get('/logout', function(req, res){
  var name = req.user.username;
  console.log("LOGGING OUT " + req.user.username)
  req.logout();
  res.redirect('/');
  req.session.notice = "You have successfully been logged out " + name + "!";
});

// token generation stuff
app.get('/get-token', function (req, res) {
  res.send('This is only allowed with a POST request.');
});

app.post('/get-token', auth.login);


// get an instance of the router for api routes
var apiRoutes = express.Router();

apiRoutes.get('/', function(req, res) {
  res.json({ message: 'API OK' });
});

apiRoutes.post('/grade', function (req, res) {
  res.send(
  	{
  		'grade':'0.8',
  		'annotations': [
  			{
  				'id': '0',
  				'x': '0.234',
  				'y': '2.345',
  				'label': 'hemorrhage'
  			},
  			{
  				'id': '1',
  				'x': '8.324',
  				'y': '32.445',
  				'label': 'exudate'
  			},
  		]
  	}
  	);
});

app.all('/api/v1/*', [require('./middleware/validateRequest')]);
app.use('/api/v1/', apiRoutes);

// If no route is matched by now, it must be a 404
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

var server = app.listen(PORT, '0.0.0.0', function() {
  console.log('The API server is listening on port ' + server.address().port);
});
