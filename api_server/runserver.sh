#!/bin/bash
echo "setting environment variables for the mongodb and the tensorflow server"

# first mongo
export DB_SERVICE_HOST=$(cat /etc/hosts | grep mongo | awk {'print $1'})

# tf-models
export GRADE_EYE_SERVICE_HOST=$(cat /etc/hosts | grep tf-model-eye | awk {'print $1'})
export GRADE_EYE_SERVICE_PORT=8080
export GRADE_FLOWER_SERVICE_HOST=$(cat /etc/hosts | grep tf-model-flower | awk {'print $1'})
export GRADE_FLOWER_SERVICE_PORT=8080

# starting application
nodemon
