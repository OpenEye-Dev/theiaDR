#!/bin/bash
echo "setting environment variables for the mongodb and the tensorflow server"

# first mongo
export DB_SERVICE_HOST=$(cat /etc/hosts | grep mongo | awk {'print $1'})

# tf-server
export GRADE_SERVICE_HOST=$(cat /etc/hosts | grep tf-server | awk {'print $1'})
export GRADE_SERVICE_PORT=8080
