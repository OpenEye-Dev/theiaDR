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

TODO: automate the above.  

TODO: Clean up everything down here!!!  

## Test Docker local deployment

We have the following functionalities which can be tested:  
  
1. Authentication: 
  
**a.** To register a new account, go to a terminal and run (The signup code is CS193S)  
  
`curl -X POST -H "Content-Type: application/json" --data '{ "username": "USERNAME_GOES_HERE", "password":"PASSWORD_GOES_HERE", "signupCode":"CS193S"}' localhost:8080/api/register`  
  
If it was successful, you should get a response similar to the following on terminal:  
`{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OGMxZDFjZGEwZTI4ZDAwMmZmYzQ5NDMiLCJpYXQiOjE0ODkwOTcxNjUsImV4cCI6MTQ4OTE0MDM2NX0.wo7wVdWTLmEc2XpiUHEfkVTcNijRVXVoduX6InJHoD4", "expiresIn":43200}`  
  
Great! You made a profile and got your refresh bearer token. If this part is very slow or stuck and there’s no response, then go back to the terminal running the original nodejs server (from Step 3 of the Local Setup) where you’re running the server and see if there are any error messages. You should ideally see a single line that looks like the last line here:


**b.** To login, you’d run:  
`curl -X POST -H "Content-Type: application/json" --data '{ "username": "USERNAME_GOES_HERE", "password":"PASSWORD_GOES_HERE"}' localhost:8080/api/login`  
  
And get a similar response with the token as with the registration.  
  
2. HTTP requests:  
Now that you have a bearer token (which expires in 12 hours), you can send requests for grading images or send annotations on images (as an API call). For this, you’d run:  
  
**a.** Image grading requests:
Run the following (replace the TOKEN with the token you received earlier and change the path to a local image file - to replicate our results use this [image](http://www.optometricmanagement.com/content/archive/2010/December/images/OM_December_A11_Fig01.jpg)):

`curl -X POST -H 'Authorization: Bearer TOKEN_GOES_HERE' -F "image=@/path/to/image.jpg" localhost:8080/api/grade`

This should return the following indicating that the request was successful and you would see a similar grading output (the model classifies the image as ‘healthy’ and ‘unhealthy’). The linked image we gave was of a very unhealthy human retina - hence we see 85% predicted unhealthy!  
  
To send an annotation back to the server, run:  
`curl -X POST -H 'Authorization: Bearer TOKEN_GOES_HERE' -H "Content-Type: application/json" --data '{"username":"USERNAME_GOES_HERE", "annotation":{"x":1,"y":2}}' localhost:8080/api/annotation`  
  
You should see simply `{"message":"Annotation received."}`. Through the steps described earlier, you can go to the postgres database and verify that the annotation was received properly in the relation “annotations” in the database “opendoc”. If you had left the terminal open from the “Local Setup” Step 6 earlier, you can run the sql query `select * from annotations;` to see this annotation in the database.

## Kubernetes infrastructure deployment
*Clone the project git repository if you haven’t done it yet and make sure you are in the main folder, i.e. code-scale-image-api-server/ of the repository - master branch)*
  
At the beginning you can decided between the following two options:  

### 1. Minikube - local 🖥
Running Kubernetes locally by [installing](https://github.com/kubernetes/minikube) it first and then launching minikube using `minikube start`.

### 2. Google Cloud Platform - cloud 🌬☁️
Running in production on our Google Cloud Platform project.

---

Then you can use the **control.sh** script in code-scale-image-api-server independently of your previous choice.  
**Note:** The options 1.start_all and 3.stop_all are related to a cluster on gcloud, so do not select that if you’re testing locally on minikube.

  
Only for the latter (GCP), check on the Google Cloud Container Engine > Container Cluster webpage if a cluster is already running (confirm with the rest of the team at the #containers-feed channel on Slack) and if not here’s how to create one (**Note:** Skip the next command if you have minikube running):  

```
./control.sh
1. start_all (this command would create a cluster and start all the kubernetes processes)
```
_Make yourself a cup of tea, it is going to take a while...☕️_

If you are running minikube, use:
```
./control.sh
2. start_processes
```

We suggest keeping some shell windows open in order to monitor what’s happening using:  
`watch -n 0.3 kubectl get ( po | svc | deploy )`  
  
**GCP Teardown reminder**  
Step by step:  
```
kubectl delete { po | svc | rc | deploy } --all
gcloud container clusters delete NAME
```
Automated:  
```
./control.sh
3. stop_all
```

**Minikube Teardown**  
Automated:  
```
./control.sh
4. stop_processes

minikube stop
```

### Public images

Kubernetes needs public images (either in docker-hub or in the Google Container Engine Registry of your project) in order to spin up pods.

#### Docker hub

In the following steps I will describe how to push a local image to docker-hub. You can either create your own account and follow along or directly find the latest images at [cloud.docker.com/cs193s](https://cloud.docker.com/swarm/cs193s/repository/list).

1. Build a docker image locally
2. Tag the image: `docker tag <local-image-id> <docker-hub-username>/<image>:<tag>`
3. Push it to docker-hub: `docker push <docker-hub-username>/<image>:<tag>`

#### Google Container Engine Registry (GKE Registry)

Another approach could be pushing your local images to the GCE Registry of your project.

1. Make sure your gcloud client is set up correctly: `gcloud info`
2. Tag the image: `docker tag <local-image-id> gcr.io/<your-project-id>/<image>:<tag>`
3. Push it to GCER: `gcloud docker -- push gcr.io/<your-project-id>/<image>:<tag>`

Reference: [https://cloud.google.com/container-registry/docs/pushing](https://cloud.google.com/container-registry/docs/pushing)

##### Current images options:
| SERVICE           | IMAGE TAG BASE NAME | PRIVATE IMAGES | CI PUSH | CI TESTS | SLACK INTEGRATION | BUILD TIME |
| ----------------- |:-------------------:|:----------------:|:--------:|:--------:|:-----------------:|-----------:|
| Cloud Docker | cs193s/ | premium 💸 | ✅ | ✅ | ✅ | ~ 4-7 mins |
| GKE | gcr.io/medical-image-grading-api | ✅ | ✅ | ❌ | ❌ | ~ 3 mins |

### Kubernetes processes

#### Manual

##### The Imperative Way

The imperative way is usually the one you use to try out things and get to a working system. You manually tweak it and at some point it is to your liking. However, if you keep on using this imperative style for deploying and managing your software you will encounter several problems (even if you automate the steps).  
  
From the images created in the previous sections we can create containers run inside Kubernetes pod be by the following command: `kubectl run <deploy-name> --image=<image>:<tag> --port=80`.  
For example: `kubectl run api-pod --image=cs193s/api_server:test --port=80`

##### The Declarative Way

The declarative way on the other hand, is what you should come up with once you go into actually deploying and managing your software in production or integrating with continuous delivery pipelines. You might have tried out stuff the imperative way before, but once you know how it should look like, you sit down and "make it official" by writing it into a declarative definition in .yml files.

1. `kubectl create -f kubernetes/db.yml`
2. `kubectl create -f kubernetes/web.yml`
3. `kubectl create -f kubernetes/grade.yml`

Reference: [https://www.youtube.com/watch?v=NrzrpyMLWes](https://www.youtube.com/watch?v=NrzrpyMLWes)

#### Automated script

This script automates all the above mentioned steps.  
* Make sure that your kubernetes processes are not already running. (check using `kubectl get ( po | svc | deploy )`).  
If that's the case run:
```
./control.sh
5. restart_processes
```
which under the hood does the following:  
```
./control.sh
4. stop_processes
2. start_processes
```

# Tests 🛠

## Google Cloud Platform orchestration

Once you followed the ‘Kubernetes processes’ section and see the pods, services and deployments running, you can test the functionality as follow:  

1. Note down the external-ip address using:  
```
./control.sh
7. get
1. external-ip
```
2. Send the following curl request to the external-ip just found in order to register a new user. Note down your token for step 3:  
```
curl -X POST -H "Content-Type: application/json" --data '{ "username": "USERNAME_GOES_HERE", "password":"PASSWORD_GOES_HERE", "signupCode":"CS193S"}' EXTERNAL-IP:80/api/register
```
3. Send a grade request:  
```
curl -X POST -H 'Authorization: Bearer TOKEN_GOES_HERE’ -F "image=@/path/to/image.extension" EXTERNAL-IP:80/api/grade
```

Congratulations, you’re done!!!

## Communication between api_server and mongo

The connection between web (api_server pod) and bd (mongoDB pod) can be tested in the following way:  

1. Find db cluster-ip and port: `kubectl get svc`
2. Access a web running pod by running: `kubectl exec -ti <pod-name> bash`
3. Install telnet: `apt-get update && apt-install telnet`
4. Connect to the db with the info found in 1: `telnet <db-cluster-ip> <db-port>`

> __Suggestion for Mac OS X users__  
> Open different shells (e.g. using [iTerm2](https://www.iterm2.com)) and monitor what's happening with the following commands:  
> - Install watch using brew package manager: `brew install watch`  
> - In different shells run: `watch -n 0.4 kubectl get {po, svc, deploy, rc}`  


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
