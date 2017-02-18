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
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var jwt         = require('jsonwebtoken'); // used to create, sign, and verify tokens
// var config = require('./config'); // get our config file
// var User   = require('./app/models/user'); // get our mongoose model

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Constants
const PORT = 8080;

// ROUTING
// basic test route
app.get('/', function (req, res) {
  res.send("This is where the login page would be");
});

// If no route is matched by now, it must be a 404
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
 

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

app.use('/api', apiRoutes);

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);
