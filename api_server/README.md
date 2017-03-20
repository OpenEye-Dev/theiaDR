# Headless API Server
### Authors: Dhruv J and Marco M M
This server accepts POST requests for authentication (or creating an account), returns Bearer tokens and JSONs for authentication. The following methods exist (*TODO*: swaggerjs for API calls):

### Authentication 🔐
* `/api/login` - Pass valid username and password as a JSON. Returns a bearer token which is valid for 12 hours. `curl -X POST -H "Content-Type: application/json" --data '{ "username": "USERNAME_GOES_HERE", "password":"PASSWORD_GOES_HERE"}' localhost:8080/api/login`
* `/api/register` - Pass username, password and valid signup code ('CS193S' for this class project). `curl -X POST -H "Content-Type: application/json" --data '{ "username": "USERNAME_GOES_HERE", "password":"PASSWORD_GOES_HERE", "signupCode":"SIGNUP_CODE_GOES_HERE"}' localhost:8080/api/register`

### Image grading and annotation

* `/api/grade` - expects a valid bearer token and a multipart form containing image as `image`. Send using `curl -X POST -H 'Authorization: Bearer TOKEN_GOES_HERE’ -F "image=@/path/to/image.extension" localhost:8080/api/grade`
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

Preliminary setup:
1. Install Docker (necessary) - Installing the latest version will enable you to quickly setup a container and get our server up and running.  
2. Install by going here and downloading the one relevant for your OS (see the menu on the left). 
Install our IDE (optional but recommended) - Install webstorm by going here. You are free to use whichever IDE makes you most productive.

For the next three steps please seek help of our sysad.
* Setup an account on slack and get added to our slack group.
* Setup an account on trello and get added to our Trello board.
* Make sure you are added to our github repo as a contributor - and clone the code-scale-image-api-server repository.

Now that you’re all setup, let’s fire up the server locally!
1. Spin up a container with node:   
Start docker (by double clicking the Docker icon on Mac or running docker to start the daemon on Ubuntu), fire up a terminal and run the following command: `docker pull node:boron`  

This might take a few minutes as it’s pulling the image from Docker Hub [1]. Now you should have the docker image present locally. Verify this by running docker images and seeing the following: 

| REPOSITORY        | TAG           | IMAGE ID  | CREATED | SIZE |
| ----------------- |:-------------:|:---------:|:-------:|-----:|
| node              | boron         | alphanumeric-code | 1 second ago | 659 MB  |

2. Now we need to similarly fire up our databases - mongodb and postgres. Do this by similarly running:  
```
docker pull mongo:latest  
docker run -v \`pwd\`:/data --name mongo -d mongo mongod --smallfiles  
docker run --name postgres -e POSTGRES_PASSWORD=postgres -d postgres  
```
  
NOTE: The password here is just for testing locally. We aren’t going to compromise security this way usually. Also note that the mongodb db folder will be created in the local folder you run this command in (which will contain the data dump).  
  
At this point, you should see two containers running in the background when you run docker ps:  

Congratulations! You now have your docker containers successfully running.  

3. Now get the container up and running by runnings up and running (with a linux bash) by simply running (make sure you are in the folder code-scale-image-api-server/api_server - this is very important!):  
```
docker run -it --link mongo:mongo --link postgres:postgres --rm -p 8080:8080 -v `pwd`:/src node bash
```
  
4. Setting up the machine learning container: We start by pulling the tensorflow server by running (in a new terminal window!)  
`docker pull mmmarco/tf-model`  

This should take a few minutes while the container is pulled from docker hub. Once this is setup, we run it in the background by doing:  
`docker run -d --link <NODE_CONTAINER_ID> mmmarco/tf-model`  

Where NODE_CONTAINER_ID is gotten by running `docker ps` and taking the container ID corresponding to the running node container.  

Next - we need to set the environment variable corresponding to the IP address tensorflow model server. So we start by getting the IP address by inspecting the container that is running mmmarco/tf-model. (Where, once again, you would get the TF_MODEL_CONTAINER_ID by running docker ps and taking the container ID from there.)  
  
`docker inspect <TF_MODEL_CONTAINER_ID> | grep  \”IPAddress`  
  
Copy this IP address (e.g. 172.17.0.5) and run the following command inside the node container bash which you opened in the previous step:  
```
export GRADE_SERVICE_HOST=172.17.0.5
export GRADE_SERVICE_PORT=8080
```

5. You now need to install the required packages in the node container and get the main server up and running.  
Please return to the bash prompt for the node container you started in step (3) and run the following:
```
cd src/
source runserver.sh
```
  
Great! Now to test whether everything is working, simply open up a browser tab and navigate to http://localhost:8080. You should see a cheerful, warm, welcoming message!  
  
Please keep this terminal open - we will be using it later again while testing.  
  
Now we would need to make some small changes the the databases so that the system can talk to them and you can confirm that everything’s fine with them. To see what’s going on in the mongo container, simply run:  
`docker exec -it mongo bash`  
  
This should open up a shell. In this shell, type:  
`mongo`


And you get access to the mongo shell. You’d be able to see here when a new user is added (to the database meanAuth and table users). You can see this by running:  
`show databases`  
  
This should show you a list of databases - you should see ‘meanAuth’ in them. When you run:  
```
use meanAuth
db.users.find()
```

You should see nothing.. Because there aren’t any registered users yet! This will be done later in the Tests section. You can exit the mongo shell by pressing CTRL+C and the mongo container by pressing CTRL+D.  
  
Moving on, we need to create a new user for the postgres database container, so that the nodejs system can talk to it. This can be done through the following series of commands:  
First, open up a shell on the postgres container:  
`docker exec -it postgres bash`  
  
Now switch to the postgres user  
`su - postgres`  
  
This should open up a new shell with prompt $. Open the psql shell,  
`psql`  
  
Your shell prompt should look like `- postgres-# `  
  
Now create the opendoc database with relation ‘annotations’ by running,  
```
CREATE DATABASE opendoc;
\c opendoc
```
  
You should now see a message saying:  
`You are now connected to database “opendoc” as user “postgres”`  
  
Now run the following:  
  
`CREATE TABLE annotations (annjson JSON, id INT PRIMARY KEY);`  
  
We now have our relation (table) which will contain the annotations!  
  
Now create a new user with all privileges on this relation by running,  
```
create user annotation with password ‘annotation’;
GRANT ALL PRIVILEGES on table annotations to annotation;
```
  
  
That’s it! You are now all set. You can exit this container by pressing CTRL+D thrice (till you reach your own terminal!) You can leave it open to verify the annotations getting inserted (later in this document).  
  
### Automated script

TODO: automated the above.  
 
TODO: Clean up everything down here!!!  

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

#### Step by step

##### The Imperative Way

The imperative way is usually the one you use to try out things and get to a working system. You manually tweak it and at some point it is to your liking. However, if you keep on using this imperative style for deploying and managing your software you will encounter several problems (even if you automate the steps).  
  
From the images created in the previous sections we can create containers run inside Kubernetes pod be by the following command: `kubectl run <deploy-name> --image=<image>:<tag> --port=80`.  
For example: `kubectl run api-pod --image=mmmarco/api_server:1.0 --port=80`

##### The Declarative Way

The declarative way on the other hand, is what you should come up with once you go into actually deploying and managing your software in production or integrating with continuous delivery pipelines. You might have tried out stuff the imperative way before, but once you know how it should look like, you sit down and "make it official" by writing it into a declarative definition in .yml files.

1. `kubectl create -f kubernetes/db.yml`
2. `kubectl create -f kubernetes/web.yml`

Reference: [https://www.youtube.com/watch?v=NrzrpyMLWes](https://www.youtube.com/watch?v=NrzrpyMLWes)

#### Automated script

This script automates all the above mentioned steps.
* Make sure that you don't already have a running cluster called cl1.
* Launch `./cluster.start.sh`

The script will run points 1,2,3,4 in [Tests > Kubernetes](#kubernetes).

# Tests 🛠

## api_server

* Test if things are up and running by navigating to localhost:8080 - you should see a cheerful, warm, welcoming message
* You can access the mongodb shell from the running container by `docker exec -it mongo bash`

## Kubernetes

1. Start a Kubernetes cluster on gcloud: `gcloud container clusters create cl1`
2. _Make yourself a cup of tea, it is going to take a while...☕️_
3. Create mongo pod and service: `kubectl create -f kubernetes/db.yml`
4. Create api_server pod, deploy and service: `kubectl create -f kubernetes/web.yml`
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
