# http://blog.abhinav.ca/blog/2014/06/17/develop-a-nodejs-app-with-docker/
# Use prepackaged node image
FROM node:boron

ENV BASE_PATH /usr/local/api_server

# Create app directory
RUN mkdir -p $BASE_PATH
WORKDIR $BASE_PATH

# Copy files and install dependencies
COPY . $BASE_PATH
RUN npm install

CMD ["npm", "start"]
