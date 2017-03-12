# NOTE: Run this in the folder ~/retrain on the gpu1 VM
import os, tensorflow as tf
BASE_FOLDER = '/home/dhruv_joshi_1989/retrain/Mar-11-model'

image_data = tf.gfile.FastGFile(os.path.join(BASE_FOLDER, 'retina.jpg'), 'rb').read()

# A list of the actual labels
label_lines = ["healthy", "unhealthy"]

with tf.gfile.FastGFile(os.path.join(BASE_FOLDER,"output_graph.pb"), 'rb') as f:
    graph_def = tf.GraphDef()
    graph_def.ParseFromString(f.read())
    _ = tf.import_graph_def(graph_def, name='')

with tf.Session() as sess:
    # Feed the image_data as input to the graph and get first prediction
    softmax_tensor = sess.graph.get_tensor_by_name('final_result:0')
    
    predictions = sess.run(softmax_tensor, \
             {'DecodeJpeg/contents:0': image_data})
    
    # Sort to show labels of first prediction in order of confidence
    top_k = predictions[0].argsort()[-len(predictions[0]):][::-1]
    
    for node_id in top_k:
        human_string = label_lines[node_id]
        score = predictions[0][node_id]
        print('%s (score = %.5f)' % (human_string, score))

