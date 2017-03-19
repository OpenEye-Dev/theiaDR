/*
 * API SERVER v2
----------------------------------------------------------------
 * Author: Dhruv Joshi
 * 
 * A headless API server which shall authenticate, authorize and pass user requests for grading
 * to tensorflow serving or pass user annotations to the appropriate database and storage
 *
 * References:
 * 1. https://scotch.io/tutorials/authenticate-a-node-js-api-with-json-web-tokens
 * 2. http://thejackalofjavascript.com/architecting-a-restful-node-js-app/
 * 3. https://www.ctl.io/developers/blog/post/build-user-authentication-with-node-js-express-passport-and-mongodb
 * 4. https://bitbucket.org/hyphe/blog-examples/src/59f61b2d8e68c7d3630b40964c4fe3c191d60de6/authentication/basicScenario.js?at=master&fileviewer=file-view-default
 * 5. https://www.sitepoint.com/user-authentication-mean-stack/
 */
'use strict';

// basic config
const PORT = 8080;
const SECRET = 'thisShouldNotBeHere';   // TODO: Remove this when setting up production environment

// modules
const bodyParser = require('body-parser');
const express = require('express');
const expressJwt = require('express-jwt');
const http = require('http');
const jwt = require('jsonwebtoken');
const logger = require('morgan');
const passport = require('passport');

require('./models/db');
require('./config/passport');
var routesApi = require('./routes/index');

// server setup
const app = express();
const authenticate = expressJwt({
  secret: SECRET
});
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(passport.initialize());

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/', function(req, res) {
  res.status(200).send('You are lost. Please contact your system administrator.');
});

app.use('/api', routesApi);

// [SH] Catch unauthorised errors
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401);
    res.json({"message" : err.name + ": " + err.message});
  }
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

http.createServer(app).listen(PORT, function() {
  console.log('server listening on port ', PORT);
});