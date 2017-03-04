// https://bitbucket.org/hyphe/blog-examples/src/59f61b2d8e68c7d3630b40964c4fe3c191d60de6/authentication/basicScenario.js?at=master&fileviewer=file-view-default
// https://www.sitepoint.com/user-authentication-mean-stack/


'use strict';

///////////////////
// configuration //
///////////////////
const PORT = 8080;
const SECRET = 'thisShouldNotBeHere';
const TOKENTIME = 120 * 60; // in seconds

/////////////
// modules //
/////////////
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

////////////
// server //
////////////
const app = express();
const authenticate = expressJwt({
  secret: SECRET
});
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(passport.initialize());

app.get('/', function(req, res) {
  res.status(200).send('You are lost. Please contact your system administrator.');
});

app.use('/api', routesApi);

/*
app.post('/auth', passport.authenticate(
  'local', {
    session: false,
    scope: []
  }), serialize, generateToken, respond);


app.get('/grade', authenticate, function(req, res) {
  // This function will send a request to the tensorflow server
  res.status(200).json(
    {'grade':''}
    );
});
*/
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

////////////
// helper //
////////////
function serialize(req, res, next) {
  db.updateOrCreate(req.user, function(err, user) {
    if (err) {
      return next(err);
    }
    // we store information needed in token in req.user again
    req.user = {
      id: user.id
    };
    next();
  });
}

function generateToken(req, res, next) {
  req.token = jwt.sign({
    id: req.user.id,
  }, SECRET, {
    expiresIn: TOKENTIME
  });
  next();
}

function respond(req, res) {
  res.status(200).json({
    user: req.user,
    token: req.token
  });
}