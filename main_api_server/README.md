# Quickstart
* First pull and start a new mongodb container. Run `docker pull mongo:latest`. This will create a new mongo image when you run `docker images`.
* Start this mongodb container and run it as a process in the background using ```docker run -v `pwd`:/data --name mongo -d mongo mongod --smallfiles```. Make sure you are running it in a folder dedicated to this project.
* Clone this repo. `git clone <this-repo>`
* `cd /path/to/repo`
* Build the container using `docker build -t <your-name>/<container-name> .`
* Run the container with an interactive shell using ```docker run -it --link mongo:mongo --rm -p 8080:8080 -v `pwd`:/src <your-name>/<container-name>```
* Now you have a new BASH shell dedicated to your development. Check if the mongodb connection is working by running `curl $MONGO_PORT_27017_TCP_ADDR:27017`. This would try to connect to the mongodb server over HTTP. If everything is fine, you would get a reply saying ```It looks like you are trying to access MongoDB over HTTP on the native driver port.```
* NOTE: To find the IP address of the node container, run ```ip addr show eth0 | grep inet```
* Run `source runserver.sh` to install dependencies and start the server on port 8080
* Navigate to localhost:8080 to see ```Welcome to the Server. The login page will go here.``` indicating it's working fine. The server will automatically pick up changes as you make changes to files in this directory. The bash shell opened up will show you what's going on.

# Tests
* Test the login API using the command ```curl -H "Content-type:application/json" -X POST --data '{"username":"something", "password" : "something"}'  http://localhost:8080/login```

# References

* [https://nodejs.org/en/docs/guides/nodejs-docker-webapp/](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
* [http://blog.abhinav.ca/blog/2014/06/17/develop-a-nodejs-app-with-docker/](http://blog.abhinav.ca/blog/2014/06/17/develop-a-nodejs-app-with-docker/)
* [https://docs.docker.com/engine/tutorials/dockervolumes/](https://docs.docker.com/engine/tutorials/dockervolumes/)
* [http://thejackalofjavascript.com/architecting-a-restful-node-js-app/](http://thejackalofjavascript.com/architecting-a-restful-node-js-app/)
* [https://crackstation.net/hashing-security.htm](https://crackstation.net/hashing-security.htm)
* [http://stackoverflow.com/questions/24319662/from-inside-of-a-docker-container-how-do-i-connect-to-the-localhost-of-the-mach](http://stackoverflow.com/questions/24319662/from-inside-of-a-docker-container-how-do-i-connect-to-the-localhost-of-the-mach)