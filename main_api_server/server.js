'use strict';
/*
 * API SERVER 1
----------------------------------------------------------------
 * Author: Dhruv Joshi
 * References:
 * 1. https://scotch.io/tutorials/authenticate-a-node-js-api-with-json-web-tokens
 * 2. 
 */

const express = require('express');

// App
const app = express();

var bodyParser  = require('body-parser');
var logger      = require('morgan');
var mongoose    = require('mongoose');
var jwt         = require('jsonwebtoken'); // used to create, sign, and verify tokens
// var config = require('./config'); // get our config file
// var User   = require('./app/models/user'); // get our mongoose model
var auth = require('./routes/auth.js');

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

// Constants
const PORT = 8080;

// ROUTING
// basic test route
app.get('/', function (req, res) {
  res.send("Welcome to the Server. The login page will go here.");
});

// login stuff..
app.get('/login', function (req, res) {
  res.send('Login is only allowed with a POST request.');
});

app.post('/login', auth.login);


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
