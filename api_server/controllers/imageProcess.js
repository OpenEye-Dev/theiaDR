// code for processing images
// using https://github.com/expressjs/multer for parsing multipart form data
/*
 NOTE: In the cURL POST request or any POST request sent to this, you need to 
 have the fieldname be 'uploadedImage'. 

 See http://stackoverflow.com/questions/31530200/node-multer-unexpected-field
 */
var maxSize = 1 * 1024 * 1024;    // max file size for image

var multer  = require('multer');
var upload = multer({
  limits: { fileSize: maxSize }
}).single('image');
var mongoose = require('mongoose');
var User = mongoose.model('User');

// image uploading and requesting to TF server
var fs = require('fs');
var request = require('request');

// connect to postgres
const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://annotation:annotation@172.17.0.3:5432/opendoc';


module.exports.gradeImage = function(req, res) {
  /*
      This function receives an image, parses the request body using multer 
      (which expects the image to be sent as 'uploadedImage') and will store it
      locally and call the tensorflow server on it, which will then take over. 

  */
  upload(req, res, function (err) {
    if (err) {
      // An error occurred when uploading
      console.log(err);
      res.status(400).json({'message': 'Error! Please check the filename field and file sent.'});
      return;
    }

    // Everything went fine
    console.log('All ok with multer. Here is the req.file object:');
    console.log(req.file);

    var GRADE_URL = 'localhost:8080';   // this is the default case when running locally

    // Pass the image to tensorflow and return JSON with the annotations
     if(process.env.GRADE_SERVICE_HOST && typeof process.env.GRADE_SERVICE_HOST !== 'undefined') {
        // this is the case where it runs in production
        GRADE_URL = 'http://' + process.env.GRADE_SERVICE_HOST;
        GRADE_URL += ":" + process.env.GRADE_SERVICE_PORT;
        console.log('Grade service found in environment variables!');
     }
     GRADE_URL += '/grade';

     console.log('Sending a POST request to ' + GRADE_URL);

     var reqToBeSent = request.post(GRADE_URL, function (err, resp, body) {
          if (err) {
              console.log('Error send POST request to TF Server.');
              res.status(500).json({'message':'There was an error. Please try again later.'});
            } else {
              res.status(200).send(body);   // just forward the result from the TF server back to the client
            }
          });

          var form = reqToBeSent.form();

          // Now send the buffer object from multer - but need to add some extra stuff to make the request work
          // CREDITS: http://stackoverflow.com/questions/13797670/nodejs-post-request-multipart-form-data
          form.append('image', req.file.buffer, {contentType: req.file.mimetype, filename: req.file.originalname});
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

        // Send annotation JSON to the SQL db.
        const client = new pg.Client(connectionString);
        client.connect();
        // const query = client.query('insert into annotations (' + req.body.annotation + ')');
        const query = client.query('INSERT INTO annotations (annjson, id) values ($1, $2)', [req.body.annotation, 1]);
        query.on('end', () => { client.end(); });

        res.status(200).json({'message':'Annotation received.'});
      }
    });
}
