# Image Grading API for Medical Images [![npm](https://img.shields.io/npm/v/npm.svg)]() [![Docker Automated buil](https://img.shields.io/docker/automated/jrottenberg/ffmpeg.svg)]()
Adapted from course Project for CS193S (Stanford University, Winter 2016-17)

Authors: Marco Montalto Monella, Dhruv Joshi

# Purpose
We endeavour to build a highly scalable platform for Medical image grading in the cloud. This system would be engineered to scale horizontally and vertically, and in the number of services that can be provided (in this case, the system works for diabetic retinopathy images, but can be extended to other use medical cases as well (radiology).

# Quickstart (local development)
* Make sure the docker daemon is running.
* Create a file `api_server/controllers/SIGNUP_CODES.txt` with signup codes on each new line (will be required when creating a profile on the web interface)
* Run `./start.sh`. Follow the instructions.

# Module container generation and deployment
* The purpose of this `gen-container.sh` is to clone the whole project repo, with one arg, the subdirectory (called module). If not specified, an interactive menu will be shown in order to choose a module. A docker container will be build and run.
* Option -d (--dev): run a container in terminal interactive mode with bash.
* Option -l (--list): print out the build and run commands for the specified module. 
Example: `./genContainer.sh annotation_ui`
* TODO: this script will be made as general as possible in order to be used for all the other modules.
* TODO: keep record of tags and increase tag number upon successful rerun. At the moment is giving tag '0.1' as default.

# Kubernetes deployment
To deploy a single container on kubernetes, we followed the steps:
* CD to your Dockerfile location
* Create the docker image using `docker run -t <DOCKER_IMAGE_NAME> .`

* It is assumed that `kubectl` and `gcloud SDK` is installed on the VM you're on. Update your configuration using `gcloud config set compute/zone us-west1-b`

Now run [3] `kubectl run --image=<DOCKER_IMAGE_NAME> <KUBERNETES_DEPLOYMENT_NAME> --port=80 --env="DOMAIN=cluster"`
* Launch the cluster of VMs
```
gcloud container clusters create cluster-1
gcloud config set container/cluster cluster-1
gcloud container clusters get-credentials cluster-1
gcloud container clusters list
```

* `kubectl get deployment <KUBERNETES_DEPLOYMENT_NAME>`
* If you want to scale the number of deployments, run 
`$ kubectl scale deployment <KUBERNETES_DEPLOYMENT_NAME> --replicas=4`
`$ kubectl get deployment <KUBERNETES_DEPLOYMENT_NAME>`

* Next, we expose it to the internet with a loadbalancer:
`$ kubectl expose deployment <KUBERNETES_DEPLOYMENT_NAME> --type="LoadBalancer"`
`$ kubectl get deployment <KUBERNETES_DEPLOYMENT_NAME>`

* Create a service object [2] that exposes the deployment using `kubectl expose deployment <KUBERNETES_DEPLOYMENT_NAME> --type=LoadBalancer --name=<SERVICE_NAME>`. Now to find the external IP of the system (or whether one has been created), use `kubectl get services <SERVICE_NAME>` and look at the *EXTERNAL-IP*.

## Notes
* If you stop the VMs part of a cluster manually from the Compute Engine page, they get re-spawned and they will keep running automatically. This is __not__ the correct way of stopping them.
* If you want to delete the cluster use: `gcloud container clusters delete <cluster-name> --zone <zone-of-the-cluster>`

# References
1. [http://christopher5106.github.io/continous/deployment/2016/05/02/deploy-instantly-from-your-host-to-AWS-EC2-and-Google-Cloud-with-kubernetes.html](http://christopher5106.github.io/continous/deployment/2016/05/02/deploy-instantly-from-your-host-to-AWS-EC2-and-Google-Cloud-with-kubernetes.html)
2. [https://kubernetes.io/docs/tutorials/stateless-application/expose-external-ip-address/](https://kubernetes.io/docs/tutorials/stateless-application/expose-external-ip-address/)
3. [https://kubernetes.io/docs/user-guide/docker-cli-to-kubectl/#docker-run](https://kubernetes.io/docs/user-guide/docker-cli-to-kubectl/#docker-run)
