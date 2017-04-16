#!/bin/bash
echo "setting environment variables for the grading server"

# first mongo
export DB_SERVICE_HOST=$(cat /etc/hosts | grep mongo | awk {'print $1'})

if [ $1 ] && [ $1 = "prod" ]; then
	# tf-models - set all the GRADING server IP addresses to be the same single tf-server container
	echo "Simulation of production mode. Multiple models activated"
	# TODO

else
	# Standard - one model
	echo "Activating development mode.."
	# TODO
	export GRADEDR_SERVICE_HOST=$(cat /etc/hosts | grep torch-server | awk {'print $1'})
fi

# all ports are 8910
export GRADEDR_SERVICE_PORT=8910

# starting application
if [ ! -d node_modules ]; then
    echo "Installing nodejs modules..."
    npm install
fi
nodemon
