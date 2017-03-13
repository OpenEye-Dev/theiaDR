#! /bin/bash

# Project config
source ../gen-config
# Module config
source ./start-config

# MongoDB
docker pull mongo:latest
docker run -v `pwd`:/data --name mongo -d mongo mongod --smallfiles

# api_server build and run
docker build -t ${DEV_USER}/${IMAGE_NAME} .
docker run -it --link mongo:mongo --rm -p 8080:8080 $CONTAINER_NAME

# Test: curl -X POST -H "Content-Type: application/json" --data '{ "username": "user1", "password":"password1", "signupCode":"CS193S"}' localhost:8080/api/register
