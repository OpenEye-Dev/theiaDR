 """
   BASIC IMAGE CLASSIFICATION MODEL TRAINING IN TENSORFLOW
   ---------------------------------------------------------------
   AUTHOR: Dhruv Joshi

   1000 randomly selected images from the Kaggle Diabetic Retinopathy training dataset
   were used to train a very basic classification model (which can be extended further)


   REFERENCES:
   * http://stackoverflow.com/questions/37340129/tensorflow-training-on-my-own-image
 """
 import util
 import tensorflow as tf

 # Constants
 TRAINING_DATA_LOCATION = 'training_data/'
 IMAGE_SIZE = 512	# assume square image - this is side size in pixels
 BATCH_SIZE = 8
 IMAGE_CHANNELS = 3

 # Get training labels
 tlabels = util.get_labels()

# Generate training batch filebane pipeline
# step 1: get filenames string list
filenames = [x[0] for x in tlabels]

# step 2: generate queue
filename_queue = tf.train.string_input_producer(filenames)

# step 3: read, decode and resize images
reader = tf.WholeFileReader()
filename, content = reader.read(filename_queue)
image = tf.image.decode_jpeg(content, channels=IMAGE_CHANNELS)
image = tf.cast(image, tf.float32)
resized_image = tf.image.resize_images(image, [IMAGE_SIZE, IMAGE_SIZE])

# step 4: Batching
image_batch = tf.train.batch([resized_image], batch_size=BATCH_SIZE)