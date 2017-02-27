"""
   BASIC IMAGE CLASSIFICATION MODEL TRAINING IN TENSORFLOW
   ---------------------------------------------------------------
   AUTHOR: Dhruv Joshi

   1000 randomly selected images from the Kaggle Diabetic Retinopathy training dataset
   were used to train a very basic classification model (which can be extended further)


   REFERENCES:
   * http://stackoverflow.com/questions/37340129/tensorflow-training-on-my-own-image
   * https://github.com/tensorflow/models/blob/master/tutorials/image/cifar10/cifar10_input.py
   * https://www.tensorflow.org/get_started/mnist/beginners
   * http://stackoverflow.com/questions/37126108/how-to-read-data-into-tensorflow-batches-from-example-queue
"""
import util
import tensorflow as tf

# Constants
TRAINING_DATA_LOCATION = 'training_data/'
IMAGE_SIZE = 512	# assume square image - this is side size in pixels
BATCH_SIZE = 8
IMAGE_CHANNELS = 3


print 'Generating queue of images to be processed...'
# Get training labels
tlabels = util.get_labels()

# Generate training batch filebane pipeline
# step 1: get filenames string list
filenames = util.training_files(TRAINING_DATA_LOCATION)
labels = [tlabels[x] for x in filenames]

# step 2: generate queue
filename_queue = tf.train.string_input_producer(filenames)

# step 3: read, decode and resize images
reader = tf.WholeFileReader()
filename, content = reader.read(filename_queue)
image = tf.image.decode_jpeg(content, channels=IMAGE_CHANNELS)
image = tf.cast(image, tf.float32)
resized_image = tf.image.resize_images(image, [IMAGE_SIZE, IMAGE_SIZE])

# step 4: Batching
image_batch, label_batch = tf.train.batch([resized_image, labels], batch_size=BATCH_SIZE)

# Create the model
x = tf.placeholder(tf.float32, [None, 784])
W = tf.Variable(tf.zeros([784, 10]))
b = tf.Variable(tf.zeros([10]))
y = tf.matmul(x, W) + b

# Define loss and optimizer
y_ = tf.placeholder(tf.float32, [None, 10])

# The raw formulation of cross-entropy,
#
#   tf.reduce_mean(-tf.reduce_sum(y_ * tf.log(tf.nn.softmax(y)),
#                                 reduction_indices=[1]))
#
# can be numerically unstable.
#
# So here we use tf.nn.softmax_cross_entropy_with_logits on the raw
# outputs of 'y', and then average across the batch.
cross_entropy = tf.reduce_mean(
  tf.nn.softmax_cross_entropy_with_logits(labels=y_, logits=y))
train_step = tf.train.GradientDescentOptimizer(0.5).minimize(cross_entropy)

sess = tf.InteractiveSession()
tf.global_variables_initializer().run()

# Train
  for _ in range(len(filenames)):
    batch_xs, batch_ys = tf.train.next_batch([resized_image, labels], batch_size=BATCH_SIZE)
    sess.run(train_step, feed_dict={x: batch_xs, y_: batch_ys})