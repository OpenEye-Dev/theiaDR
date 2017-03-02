# docker build --build-arg module=annotation_ui -t user/annotation_ui:tag .
FROM node:boron

ARG module
ENV BASE_PATH /usr/local/$module

# Create app directory
RUN mkdir -p $BASE_PATH/src
RUN mkdir -p $BASE_PATH/public
WORKDIR $BASE_PATH

# Install app dependencies
COPY package.json $BASE_PATH
RUN npm install

# Bundle app source
COPY ./src $BASE_PATH/src
COPY ./public $BASE_PATH/public

EXPOSE 8080
CMD [ "npm", "start" ]
