# Quickstart
* `git clone <this-repo>`
* `cd /path/to/repo`
* Build the container using `docker build -t <your-name>/<container-name> .`
* Run the container with an interactive shell using ```docker run -i -t --rm -p 8080:8080 -v `pwd`:/src <your-name>/<container-name>```
* Now you have a fresh BASH shell dedicated to your development. Run `source runserver.sh` to install dependencies and start the server on port 8080
* Navigate to localhost:8080 to see ```{'message':'OK'}``` indicating it's working fine. The server will automatically pick up changes as you make changes to files in this directory. The bash shell opened up will show you what's going on.

# Tests
* Test the login API using the command ```curl -H "Content-type:application/json" -X POST --data '{"username":"arvind@myapp.com", "password" : "pass123"}'  http://localhost:8080/login```

# References

* [https://nodejs.org/en/docs/guides/nodejs-docker-webapp/](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
* [http://blog.abhinav.ca/blog/2014/06/17/develop-a-nodejs-app-with-docker/](http://blog.abhinav.ca/blog/2014/06/17/develop-a-nodejs-app-with-docker/)
* [https://docs.docker.com/engine/tutorials/dockervolumes/](https://docs.docker.com/engine/tutorials/dockervolumes/)
* [http://thejackalofjavascript.com/architecting-a-restful-node-js-app/](http://thejackalofjavascript.com/architecting-a-restful-node-js-app/)
* [https://crackstation.net/hashing-security.htm](https://crackstation.net/hashing-security.htm)
* [https://www.ctl.io/developers/blog/post/build-user-authentication-with-node-js-express-passport-and-mongodb](https://www.ctl.io/developers/blog/post/build-user-authentication-with-node-js-express-passport-and-mongodb)