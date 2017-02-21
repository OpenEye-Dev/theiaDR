# Quickstart
* Build the container using `docker build -t <your-name>/<container-name> .`
* Run the container with an interactive shell using `docker run --rm -p 3000:3000 -ti <your-name>/<container-name> bash`
* Now you have a new BASH shell dedicated to your development.
* NOTE: To find the IP address of the node container, run `ip addr show eth0 | grep inet`; It will show something like the following:
<br>`inet 192.168.99.1/24 brd 192.168.99.255 vboxnet0`
* Run `npm start` to start the server on port 3000 (default).
* Navigate to the first ip address found two steps earlier on port 3000 to see ```Annotation UI``` and try to upload a picture.
* The traffic of the POST request can be monitored from `Inspect Page > Network` of your favourite browser.


# Development history
* This project was initially bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).
 And you can find the most recent version of the create-react-app guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).
