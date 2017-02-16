'use strict';

const express = require('express');

// Constants
const PORT = 8080;

// App
const app = express();
app.get('/', function (req, res) {
  res.send(
  	{
  		'message':'we come in p5c'
  	}
  	);
});

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);
