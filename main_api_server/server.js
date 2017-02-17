'use strict';

const express = require('express');

// Constants
const PORT = 8080;

// App
const app = express();
app.get('/', function (req, res) {
  res.send(
  	{
  		'message':'OK'
  	}
  	);
});

app.get('/api/grade', function (req, res) {
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

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);
