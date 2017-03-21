'''
  This is a simple Flask app to test whether a tensorflow model can be served
'''
from flask import Flask, request, Response, jsonify
import os, io, imghdr
import numpy as np
import tensorflow as tf

ALLOWED_IMAGE_FORMATS = ['jpg', 'jpeg'] # , 'png', 'tiff'

# Get the model
# A list of the actual labels
label_lines = ["healthy", "unhealthy"]

with tf.gfile.FastGFile("output_graph.pb", 'rb') as f:
  graph_def = tf.GraphDef()
  graph_def.ParseFromString(f.read())
  _ = tf.import_graph_def(graph_def, name='')

sess = tf.Session()
softmax_tensor = sess.graph.get_tensor_by_name('final_result:0')

# define the server and handle requests
app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
  return "The Tensorflow server is working."

@app.route('/grade', methods=['POST'])
def grade():
  if not request.files.has_key('image'):
    return jsonify({'message':'Incorrect fileobject key in POST request. Use - image'})
  # Feed the image_data as input to the graph and get first prediction
  image_data = request.files.get('image')

  # check the image format for specific formats
  # if it is not jpg, convert to it and continue
  CURRENT_IMAGE_FORMAT = imghdr.what(image_data)
  if not CURRENT_IMAGE_FORMAT in ALLOWED_IMAGE_FORMATS:
    return jsonify({'message': 'Image format not allowed'}), 400

  # BETTER METHOD: Convert to bytearray and then to string 
  # this is what FastGFile returns
  image_data = str(bytearray(image_data.read()))

  predictions = sess.run(softmax_tensor, {'DecodeJpeg/contents:0': image_data})
  # Sort to show labels of first prediction in order of confidence
  top_k = predictions[0].argsort()[-len(predictions[0]):][::-1]

  # Convert to bytearray and then to string 
  # this is what tf.gfile.FastGFile returns
  image_data = str(bytearray(image_data))

  predictions = sess.run(softmax_tensor, {'DecodeJpeg/contents:0': image_data})
  # Sort to show labels of first prediction in order of confidence
  top_k = predictions[0].argsort()[-len(predictions[0]):][::-1]

  grade_dict = {'message': 'OK'}    # to be sent to indicate that everything happened alright

  for node_id in top_k:
    human_string = label_lines[node_id]
    score = predictions[0][node_id]
    grade_dict[human_string] = float(score)

  return jsonify(grade_dict)

if __name__ == "__main__":
  app.run(host="0.0.0.0", port=int("8080"), debug=True)
