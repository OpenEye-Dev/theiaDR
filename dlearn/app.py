'''
  This is a simple Flask app to test whether a tensorflow model can be served
'''
from flask import Flask, request, Response, jsonify
import os, io
import numpy as np
import tensorflow as tf

# Get the model
BASE_FOLDER = '/home/dhruv_joshi_1989/retrain/Mar-11-model'

# image_data = tf.gfile.FastGFile(os.path.join(BASE_FOLDER, 'retina.jpg'), 'rb').read()

# A list of the actual labels
label_lines = ["healthy", "unhealthy"]

with tf.gfile.FastGFile(os.path.join(BASE_FOLDER,"output_graph.pb"), 'rb') as f:
    graph_def = tf.GraphDef()
    graph_def.ParseFromString(f.read())
    _ = tf.import_graph_def(graph_def, name='')

sess = tf.Session()
softmax_tensor = sess.graph.get_tensor_by_name('final_result:0')

# define the server and handle requests
app = Flask(__name__)

@app.route('/grade', methods=['POST'])
def grade():
    # Feed the image_data as input to the graph and get first prediction
    """ EXTREMELY INEFFICIENT STEP: SAVING A FILE TO DISK AND THEN READING IT AGAIN """
    image_data = request.files.get('imagefile')
    image_data.save('data.jpg')
    image_data = tf.gfile.FastGFile('data.jpg', 'rb').read()

    # BETTER METHOD BUT NOT WORKING: save to fileIO and then pass as bytearray
    # in_memory_file = io.BytesIO()
    # image_data.save(in_memory_file)
    # image_data = np.fromstring(in_memory_file.getvalue(), dtype=np.uint8)
    # image_data = bytearray(in_memory_file.getvalue())[0]
    # print image_data
    # image_data = in_memory_file.readlines()
    # print image_data
    ''''''
    predictions = sess.run(softmax_tensor, {'DecodeJpeg/contents:0': image_data})
    # Sort to show labels of first prediction in order of confidence
    top_k = predictions[0].argsort()[-len(predictions[0]):][::-1]

    for node_id in top_k:
    	human_string = label_lines[node_id]
    	score = predictions[0][node_id]
    	print('%s (score = %.5f)' % (human_string, score))
    ''''''
    return jsonify({'result':'whatever'})

if __name__ == "__main__":
  app.run(host="0.0.0.0", port=int("8080"), debug=True)
