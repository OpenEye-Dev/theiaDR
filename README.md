# Image Grading API for Medical Images
Course Project for CS193S 

Authors: Louis Brion, Marco Monella, Dhruv Joshi

# Purpose
We endeavour to build a highly scalable platform for Medical image grading in the cloud. This system would be engineered to scale horizontally and vertically, and in the number of services that can be provided (in this case, the system works for diabetic retinopathy images, but can be extended to other use medical cases as well (radiology).

# Quickstart
* `git clone <this-repo>`
* `cd /path/to/repo`
* Build the container using `docker build <your-name>/<container-name> .`
* Run the container with an interactive shell using `docker run -i -t -p 8080:8080 -v `pwd`:/src <your-name>/<container-name>`

# References

* [https://nodejs.org/en/docs/guides/nodejs-docker-webapp/](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
* [http://blog.abhinav.ca/blog/2014/06/17/develop-a-nodejs-app-with-docker/](http://blog.abhinav.ca/blog/2014/06/17/develop-a-nodejs-app-with-docker/)
* [https://docs.docker.com/engine/tutorials/dockervolumes/](https://docs.docker.com/engine/tutorials/dockervolumes/)