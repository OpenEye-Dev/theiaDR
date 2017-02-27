"""
   BASIC IMAGE CLASSIFICATION MODEL TRAINING IN TENSORFLOW
   ---------------------------------------------------------------
   AUTHOR: Dhruv Joshi

   1000 randomly selected images from the Kaggle Diabetic Retinopathy training dataset
   were used to train a very basic classification model (which can be extended further)


   REFERENCES:
   * http://stackoverflow.com/questions/37340129/tensorflow-training-on-my-own-image
   * https://github.com/tensorflow/models/blob/master/tutorials/image/cifar10/cifar10_input.py
"""
import util
import tensorflow as tf

# Constants
TRAINING_DATA_LOCATION = 'training_data/'
IMAGE_SIZE = 512	# assume square image - this is side size in pixels
BATCH_SIZE = 8
IMAGE_CHANNELS = 3

def _generate_image_and_label_batch(TRAINING_DATA_LOCATION=TRAINING_DATA_LOCATION, IMAGE_CHANNELS=IMAGE_CHANNELS, IMAGE_SIZE=IMAGE_SIZE, BATCH_SIZE=BATCH_SIZE):
	"""
	Returns list of batch of tensors and labels from the training dataset
	which is expected to be present in folder TRAINING_DATA_LOCATION
	"""
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

	return image_batch, label_batch

