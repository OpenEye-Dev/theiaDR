// code for processing images
// using https://github.com/expressjs/multer for parsing multipart form data
/*
 NOTE: In the cURL POST request or any POST request sent to this, you need to 
 have the fieldname be 'uploadedImage'. 

 See http://stackoverflow.com/questions/31530200/node-multer-unexpected-field
 */

var multer  = require('multer');
var upload = multer({ dest: 'uploads/' }).single('uploadedImage');
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports.gradeImage = function(req, res) {
  /*
      This function receives an image, parses the request body using multer 
      (which expects the image to be sent as 'uploadedImage') and will store it
      locally and call the tensorflow server on it, which will then take over. 

      TODO: When the tensorflow server responds, need to actually send back annotations.
      This should most likely be an async call from here itself.
  */
  upload(req, res, function (err) {
    if (err) {
      // An error occurred when uploading
      console.log(err);
      res.status().send('An error occurred. Please check the filename field and file sent.');
      return;
    }

    // Everything went fine
    console.log('all ok');
    console.log(req.file);
    // TODO: Pass the image to tensorflow and return JSON with the annotations

  	res.status(200).json({'message':'OK'});
  });
}

module.exports.receiveAnnotation = function(req, res) {
  /*
      Receives an annotation in the form of a JSON. The first level
      of auth will check the bearer token. This would have already been 
      checked before the annotation reached this function. The next thing which
      would be checked would be the username that is sending it. This is critical
      to mapping the annotation with who sent it. This will then be saved into 
      a relational database.
  */

  User.findOne({ username: req.body.username }, function (err, user) {
      if (err) { 
        console.log(err);
        res.status(500).json({'message':'Something went wrong. Please try again later.'});
      }
      // Return if user not found in database
      if (!user) {
        console.log('user not found');
        res.status(401).json({'message': 'Incorrect username'});
      } else {
        console.log(req.body.annotation);
        res.status(200).json({'message':'Annotation received.'});
        // Send annotation JSON to the SQL db.
      }
    });
}