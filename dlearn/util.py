# Useful functions, some which may be used once and some which would be called multiple
# times by the tensorflow system
import os, sys, pickle

def build_label_dict():
	"""
	Returns a dict which maps 
	d[filename] => label
	"""
	d = {}

	# generate a list of filename, label
	try:
		with open('trainLabels.csv') as f:
			filelabels = f.readlines()
	except IOError:
		print "Please download trainLabels.csv from \
			https://www.kaggle.com/c/diabetic-retinopathy-detection/data, save file locally and run again."
		return
	filelabels = [x.strip().split(',') for x in filelabels[1:]]

	# read into dict
	for fl in filelabels:
		d[fl[0] + '.jpeg'] = int(fl[1])

	# dump into pickle, return
	pickle.dump(d, open('fileLabels.pklz', 'w'))
	return d

def get_labels():
	"""
	returns the dict of labels if it exists locally
	if not, calls build_label_dict() and returns it
	"""
	try:
		return pickle.load(open('fileLabels.pklz', 'r'))
	except IOError:
		return build_label_dict()

def training_files(folder):
	"""
	Returns a list of training filenames, which are in the training file folder
	"""
	return os.listdir(folder)

