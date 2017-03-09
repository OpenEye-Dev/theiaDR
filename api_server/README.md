# Headless API Server
### Authors: Dhruv J and Marco M M
This server accepts POST requests for authentication (or creating an account), returns Bearer tokens and JSONs for authentication. The following methods exist (*TODO*: swaggerjs for API calls):

### Authentication 🔐
* `/api/login` - Pass valid username and password as a JSON. Returns a bearer token which is valid for 12 hours. `curl -X POST -H "Content-Type: application/json" --data '{ "username": "USERNAME_GOES_HERE", "password":"PASSWORD_GOES_HERE"}' localhost:8080/api/login`
* `/api/register` - Pass username, password and valid signup code ('CS193S' for this class project). `curl -X POST -H "Content-Type: application/json" --data '{ "username": "USERNAME_GOES_HERE", "password":"PASSWORD_GOES_HERE", "signupCode":"SIGNUP_CODE_GOES_HERE"}' localhost:8080/api/register`

### Image grading and annotation

* `/api/grade` - expects a valid bearer token and a multipart form containing image as `uploadedImage`. Send using `curl -X POST -H 'Authorization: Bearer TOKEN_GOES_HERE’ -F "image=@/path/to/image.extension" localhost:8080/api/grade`
* `/api/annotation` - send JSON with annotations along with valid bearer token.


# File structure 📂
The `sitepoint.com` reference was used extensively to build up the authentication platform part of the API. `server.js` has the main server definition using an express app.

The top folders are the following:
* `config` - contains the passport strategy definition (in passport.js)
* `controllers` - contains the controllers which are called by the router (`authentication.js` handles authentication - hashing, salting and `imageProcess.js` handlesimage handling)
* `routes` - `index.js` handles routes for `/api`
* `models` - `db.js` sets up a connection to the database and `users.js` defines methods on the user model for mongodb.

# Docker and Kubernetes 🐳

## Local deployment in Docker

### Step by step

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

### Automated script

This script automates all the above mentioned steps.
* Make sure that you don't have a mongo container already saved locally. In that case, find the container id by running `docker ps -a | grep -i mongo`. If it is running, stop it using `docker stop <container-id>`. Remove it by running `docker rm <container-id>`
* Launch `./start.sh`

## Cluster deployment in Kubernetes

Firstly create a Kubernetes cluster.
* In Google Cloud Engine use:  
`gcloud container clusters create NAME [--num-nodes=NUM_NODES; default="3"]`  
It can be resized: `gcloud container clusters resize NAME --size=SIZE`
* Locally you can install [minikube](https://github.com/kubernetes/minikube) and run `minikube start`.

> __Teardown reminder__  
> `kubectl delete { po | svc | rc | deploy } --all`  
> `gcloud container clusters delete NAME`

### Public images

Kubernetes needs public images (either in docker-hub or in the Google Container Engine Registry of your project) in order to spin up pods.

#### Docker hub

In the following steps I will describe how to push a local image to docker-hub. You can either create your own account and follow along or directly find the resulting images at __mmmarco/api_server:1.0__

1. Build a docker image locally, as shown in _Local Deployment > Step by Step_
2. Tag the image: `docker tag <local-image-id> <docker-hub-username>/<image>:<tag>`
3. Push it to docker-hub: `docker push <docker-hub-username>/<image>:<tag>`

#### Google Container Engine Registry (GCER)

In the following steps I will describe how to push a local image to the GCER of your project.

1. Make sure your gcloud client is set up correctly: `gcloud info`
2. Tag the image: `docker tag <local-image-id> gcr.io/<your-project-id>/<image>:<tag>`
3. Push it to GCER: `gcloud docker -- push gcr.io/<your-project-id>/<image>:<tag>`

Reference: [https://cloud.google.com/container-registry/docs/pushing](https://cloud.google.com/container-registry/docs/pushing)

### Running on Kubernetes

#### The Imperative Way

The imperative way is usually the one you use to try out things and get to a working system. You manually tweak it and at some point it is to your liking. However, if you keep on using this imperative style for deploying and managing your software you will encounter several problems (even if you automate the steps).  
  
From the images created in the previous sections we can create containers run inside Kubernetes pod be by the following command: `kubectl run <deploy-name> --image=<image>:<tag> --port=80`.  
For example: `kubectl run api-pod --image=mmmarco/api_server:1.0 --port=80`

#### The Declarative Way

The declarative way on the other hand, is what you should come up with once you go into actually deploying and managing your software in production or integrating with continuous delivery pipelines. You might have tried out stuff the imperative way before, but once you know how it should look like, you sit down and "make it official" by writing it into a declarative definition in .yml files.

1. `kubectl create -f db-pod.yml -f db-service.yml`
2. `kubectl create -f web-pod.yml -f web-rc.yml -f web-service.yml`

Reference: [https://www.youtube.com/watch?v=NrzrpyMLWes](https://www.youtube.com/watch?v=NrzrpyMLWes)

# Tests 🛠

## api_server

* Test if things are up and running by navigating to localhost:8080 - you should see a cheerful, warm, welcoming message
* You can access the mongodb shell from the running container by `docker exec -it mongo bash`

## Kubernetes

1. Start a Kubernetes cluster on gcloud: `gcloud container clusters create cl1`
2. _Make yourself a cup of tea, it is going to take a while...☕️_
3. Create mongo pod and service: `kubectl create -f db-pod.yml -f db-service.yml`
4. Create api_server pod, rc and service: `kubectl create -f web-pod.yml -f web-rc.yml -f web-service.yml`
5. When everything is up and running, look up at the web-loadbalacer external-ip: `kubectl get svc`
6. Send a the following auth json request to that IP and receive a token in response:  
`curl -X POST -H "Content-Type: application/json" --data '{ "username": "user1", "password":"password1", "signupCode":"CS193S"}' EXTERNAL-IP:80/api/register`

### Communication between api_server and mongo

> __Suggestion for Mac OS X users__  
> Open different shells (e.g. using [iTerm2](https://www.iterm2.com)) and monitor what's happening with the following commands:  
> - Install watch using brew package manager: `brew install watch`  
> - In different shells run: `watch -n 0.4 kubectl get {po, svc, deploy, rc}`  

The connection between web (api_server pod) and bd (mongoDB pod) can be tested in the following way:  

1. Find db cluster-ip and port: `kubectl get svc`
2. Access a web running pod by running: `kubectl exec -ti <pod-name> bash`
3. Install telnet: `apt-get update && apt-install telnet`
4. Connect to the db with the info found in 1: `telnet <db-cluster-ip> <db-port>`


# References 🔎

* [https://nodejs.org/en/docs/guides/nodejs-docker-webapp/](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
* [http://blog.abhinav.ca/blog/2014/06/17/develop-a-nodejs-app-with-docker/](http://blog.abhinav.ca/blog/2014/06/17/develop-a-nodejs-app-with-docker/)
* [https://docs.docker.com/engine/tutorials/dockervolumes/](https://docs.docker.com/engine/tutorials/dockervolumes/)
* [http://thejackalofjavascript.com/architecting-a-restful-node-js-app/](http://thejackalofjavascript.com/architecting-a-restful-node-js-app/)
* [https://crackstation.net/hashing-security.htm](https://crackstation.net/hashing-security.htm)
* [http://stackoverflow.com/questions/24319662/from-inside-of-a-docker-container-how-do-i-connect-to-the-localhost-of-the-mach](http://stackoverflow.com/questions/24319662/from-inside-of-a-docker-container-how-do-i-connect-to-the-localhost-of-the-mach)
* [https://www.digitalocean.com/community/tutorials/how-to-remove-docker-images-containers-and-volumes](https://www.digitalocean.com/community/tutorials/how-to-remove-docker-images-containers-and-volumes)
* [https://bitbucket.org/hyphe/blog-examples/src/59f61b2d8e68c7d3630b40964c4fe3c191d60de6/authentication/basicScenario.js?at=master&fileviewer=file-view-default](https://bitbucket.org/hyphe/blog-examples/src/59f61b2d8e68c7d3630b40964c4fe3c191d60de6/authentication/basicScenario.js?at=master&fileviewer=file-view-default)
* [https://www.sitepoint.com/user-authentication-mean-stack/](https://www.sitepoint.com/user-authentication-mean-stack/)
