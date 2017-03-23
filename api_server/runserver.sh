#!/bin/bash
echo "setting environment variables for the mongodb and the tensorflow server"

# first mongo
export DB_SERVICE_HOST=$(cat /etc/hosts | grep mongo | awk {'print $1'})

# tf-models
export GRADEEYE_SERVICE_HOST=$(cat /etc/hosts | grep tf-model-eye | awk {'print $1'})
export GRADEEYE_SERVICE_PORT=8080
export GRADEFLOWER_SERVICE_HOST=$(cat /etc/hosts | grep tf-model-flower | awk {'print $1'})
export GRADEFLOWER_SERVICE_PORT=8080

# starting application
nodemon
