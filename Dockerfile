# http://blog.abhinav.ca/blog/2014/06/17/develop-a-nodejs-app-with-docker/
FROM node:boron

# Set the working directory
WORKDIR   /src

CMD ["/bin/bash"]