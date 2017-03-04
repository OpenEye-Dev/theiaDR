// code for processing images
// using https://github.com/expressjs/multer for parsing multipart form data
/*
 NOTE: In the cURL POST request or any POST request sent to this, you need to 
 have the fieldname be 'uploadedImage'. 

 See http://stackoverflow.com/questions/31530200/node-multer-unexpected-field
 */

var multer  = require('multer');
var upload = multer({ dest: 'uploads/' }).single('uploadedImage');

module.exports.gradeImage = function(req, res) {
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

  	res.status(200).send('OK');
  });
}

module.exports.receiveAnnotation = function(req, res) {
  console.log(req);
  res.status(200).send('OK');
}