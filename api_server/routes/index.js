// routes for the API server
var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');

var auth = jwt({
  secret: 'MY_SECRET',
  userProperty: 'payload'
});

// get controllers containing functions for API request processing
var ctrlProfile = require('../controllers/profile');
var ctrlAuth = require('../controllers/authentication');
var ctrlImage = require('../controllers/imageProcess');

// authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

// image-related requests
router.post('/grade', auth, ctrlImage.gradeImage);
router.post('/annotation', auth, ctrlImage.receiveAnnotation);

module.exports = router;