#!/bin/bash
echo "setting environment variables for the mongodb and the tensorflow server"

# first mongo
export DB_SERVICE_HOST=$(cat /etc/hosts | grep mongo | awk {'print $1'})

if [ $1 ] && [ $1 = "dev" ]; then
	# tf-models - set all the GRADING server IP addresses to be the same single tf-server container
	echo "Development mode. Setting all grading services to be the single tf-server"
	export GRADEEYE_SERVICE_HOST=$(cat /etc/hosts | grep tf-server | awk {'print $1'})
	export GRADEFLOWER_SERVICE_HOST=$(cat /etc/hosts | grep tf-server | awk {'print $1'})

else
	# tf-models
	echo "Normal mode. There are multiple grading services (flower and eye)"
	export GRADEEYE_SERVICE_HOST=$(cat /etc/hosts | grep tf-model-eye | awk {'print $1'})
	export GRADEFLOWER_SERVICE_HOST=$(cat /etc/hosts | grep tf-model-flower | awk {'print $1'})
fi

# all ports are 8080 anyway
export GRADEEYE_SERVICE_PORT=8080
export GRADEFLOWER_SERVICE_PORT=8080

# starting application
nodemon
