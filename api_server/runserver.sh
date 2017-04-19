#!/bin/bash
echo "setting the environment variables for the node server..."
echo -n "Please choose a secret for the JSON web token: "
read JWT_SECRET
export JWT_SECRET=JWT_SECRET

if [ ! -f controllers/SIGNUP_CODES.txt ]; then
	echo ""
	echo 'Could not find file SIGNUP_CODES.txt in controllers/ folder!'
	echo 'You will have to setup the signup code manually. '
	echo 'Please create a new file controllers/SIGNUP_CODES.txt and'
	echo 'add string signupcodes on each new line. Exiting...'
	exit 0
else
	echo 'Found SIGNUP_CODES.txt. The codes will be printed to console when the server starts.'
fi

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
export GRADEDR_SERVICE_PORT=8080

# starting application
if [ ! -d node_modules ]; then
    echo "Installing nodejs modules..."
    npm install
fi
nodemon
