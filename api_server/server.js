// https://bitbucket.org/hyphe/blog-examples/src/59f61b2d8e68c7d3630b40964c4fe3c191d60de6/authentication/basicScenario.js?at=master&fileviewer=file-view-default
// 
// start with node authentication/refreshTokenScenario.js
'use strict';

///////////////////
// configuration //
///////////////////
const PORT = 8080; // i know, its old...
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
const Strategy = require('passport-local');

const app = express();
const authenticate = expressJwt({
  secret: SECRET
});

////////////////////
// database dummy //
////////////////////
const db = {
  updateOrCreate: function(user, cb) {
    // db dummy, we just cb the user
    cb(null, user);
  },
  authenticate: function(username, password, cb) {
    // database dummy - find user and verify password
    if (username === 'devils' && password === '666') {
      cb(null, {
        id: 666,
        firstname: 'devils',
        lastname: 'name',
        email: 'devil@he.ll',
        verified: true
      });
    } else {
      cb(null, false);
    }
  }
};

//////////////
// passport //
//////////////
passport.use(new Strategy(
  function(username, password, done) {
    db.authenticate(username, password, done);
  }
));

////////////
// server //
////////////
app.use(logger('dev'));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.status(200).send('You are lost. Please contact your system administrator.');
});

app.post('/auth', passport.initialize(), passport.authenticate(
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