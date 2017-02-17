# Quickstart
* `git clone <this-repo>`
* `cd /path/to/repo`
* Build the container using `docker build -t <your-name>/<container-name> .`
* Run the container with an interactive shell using ```docker run -i -t --rm -p 8080:8080 -v `pwd`:/src <your-name>/<container-name>```
* Now you have a fresh BASH shell dedicated to your development. Run `npm install` to install the modules in node (which get saved locally on disk)
* Install nodemon using `npm install nodemon`
* Run `nodemon` to start the server on localhost:8080, it will automatically pick up changes

# References

* [https://nodejs.org/en/docs/guides/nodejs-docker-webapp/](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
* [http://blog.abhinav.ca/blog/2014/06/17/develop-a-nodejs-app-with-docker/](http://blog.abhinav.ca/blog/2014/06/17/develop-a-nodejs-app-with-docker/)
* [https://docs.docker.com/engine/tutorials/dockervolumes/](https://docs.docker.com/engine/tutorials/dockervolumes/)