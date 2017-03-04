# Headless API Server
### Author: Dhruv Joshi
This server accepts POST requests for authentication (or creating an account), returns Bearer tokens and JSONs for authentication. The following methods exist (*TODO*: swaggerjs for API calls):

### Authentication
* `/api/login` - Pass valid username and password as a JSON. Returns a bearer token which is valid for 12 hours. `curl -X POST -H "Content-Type: application/json" --data '{ "username": "USERNAME_GOES_HERE", "password":"PASSWORD_GOES_HERE"}' localhost:8080/api/login`
* `/api/register` - Pass username, password and valid signup code ('CS193S' for this class project). `curl -X POST -H "Content-Type: application/json" --data '{ "username": "USERNAME_GOES_HERE", "password":"PASSWORD_GOES_HERE", "signupCode":"SIGNUP_CODE_GOES_HERE"}' localhost:8080/api/register`

### Image grading and annotation

* `/api/grade` - expects a valid bearer token and a multipart form containing image as `uploadedImage`. Send using `curl -X POST -H 'Authorization: Bearer TOKEN_GOES_HERE’ -F "image=@/path/to/image.extension" localhost:8080/api/grade`
* `/api/annotation` - send JSON with annotations along with valid bearer token.


# File structure
The `sitepoint.com` reference was used extensively to build up the authentication platform part of the API. `server.js` has the main server definition using an express app.

The top folders are the following:
* `config` - contains the passport strategy definition (in passport.js)
* `controllers` - contains the controllers which are called by the router (`authentication.js` handles authentication - hashing, salting and `imageProcess.js` handlesimage handling)
* `routes` - `index.js` handles routes for `/api`
* `models` - `db.js` sets up a connection to the database and `users.js` defines methods on the user model for mongodb.

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
* You can access the mongodb shell from the running container by `docker exec -it mongo bash`

# References

* [https://nodejs.org/en/docs/guides/nodejs-docker-webapp/](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
* [http://blog.abhinav.ca/blog/2014/06/17/develop-a-nodejs-app-with-docker/](http://blog.abhinav.ca/blog/2014/06/17/develop-a-nodejs-app-with-docker/)
* [https://docs.docker.com/engine/tutorials/dockervolumes/](https://docs.docker.com/engine/tutorials/dockervolumes/)
* [http://thejackalofjavascript.com/architecting-a-restful-node-js-app/](http://thejackalofjavascript.com/architecting-a-restful-node-js-app/)
* [https://crackstation.net/hashing-security.htm](https://crackstation.net/hashing-security.htm)
* [http://stackoverflow.com/questions/24319662/from-inside-of-a-docker-container-how-do-i-connect-to-the-localhost-of-the-mach](http://stackoverflow.com/questions/24319662/from-inside-of-a-docker-container-how-do-i-connect-to-the-localhost-of-the-mach)
* [https://www.digitalocean.com/community/tutorials/how-to-remove-docker-images-containers-and-volumes](https://www.digitalocean.com/community/tutorials/how-to-remove-docker-images-containers-and-volumes)
* [https://bitbucket.org/hyphe/blog-examples/src/59f61b2d8e68c7d3630b40964c4fe3c191d60de6/authentication/basicScenario.js?at=master&fileviewer=file-view-default](https://bitbucket.org/hyphe/blog-examples/src/59f61b2d8e68c7d3630b40964c4fe3c191d60de6/authentication/basicScenario.js?at=master&fileviewer=file-view-default)
 * [https://www.sitepoint.com/user-authentication-mean-stack/](https://www.sitepoint.com/user-authentication-mean-stack/)