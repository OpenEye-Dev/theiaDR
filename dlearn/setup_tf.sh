# !/bin/bash
# setup tensorflow for training on cloud
# assume: you have sudo access and this is a legit google cloud VM with NVIDIA Tesla GPUs
# assume: you have downloaded CUDNN from https://developer.nvidia.com/compute/machine-learning/cudnn/secure/v5.1/prod_20161129/8.0/cudnn-8.0-linux-x64-v5.1-tgz
# ^requires making an account

# start by installing pip and python-dev
sudo apt-get install python-pip python-dev python-virtualenv 
pip install --upgrade	# upgrade pip

# Create a virtualenv called 'tf' and activate it
virtualenv --system-site-packages tf
source ~/tf/bin/activate

# Install tensorflow for Python 2.7 and GPU, set library paths as environment vars
pip install --upgrade tensorflow-gpu
export LD_LIBRARY_PATH="$LD_LIBRARY_PATH:/usr/local/cuda/lib64" 
export CUDA_HOME=/usr/local/cuda

# Install other useful libraries
pip install keras pandas matplotlib sklearn

# Next: you need to install CUDNN
# use the following to extract:
# tar -xvzf cudnn-8.0-linux-x64-v5.1.tgz
# mv cudnn-8.0-linux-x64-v5.1/ cuda/

# The CUDNN library is present in a local folder called 'cuda'
# copy header files to system locations
cd cuda/
sudo cp -P include/cudnn.h /usr/include 
sudo cp -P lib64/libcudnn* /usr/lib/x86_64-linux-gnu/ 
sudo chmod a+r /usr/lib/x86_64-linux-gnu/libcudnn*

# copy library headers to appropriate places where TF will look for them
sudo cp include/cudnn.h /usr/local/cuda-8.0/include 
sudo cp lib64/* /usr/local/cuda-8.0/lib64/