# Image Grading API for Medical Images
Course Project for CS193S 

Authors: Louis Brion, Marco Monella, Dhruv Joshi

# Purpose
We endeavour to build a highly scalable platform for Medical image grading in the cloud. This system would be engineered to scale horizontally and vertically, and in the number of services that can be provided (in this case, the system works for diabetic retinopathy images, but can be extended to other use medical cases as well (radiology).

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


# References
1. [http://christopher5106.github.io/continous/deployment/2016/05/02/deploy-instantly-from-your-host-to-AWS-EC2-and-Google-Cloud-with-kubernetes.html](http://christopher5106.github.io/continous/deployment/2016/05/02/deploy-instantly-from-your-host-to-AWS-EC2-and-Google-Cloud-with-kubernetes.html)
2. [https://kubernetes.io/docs/tutorials/stateless-application/expose-external-ip-address/](https://kubernetes.io/docs/tutorials/stateless-application/expose-external-ip-address/)
3. [https://kubernetes.io/docs/user-guide/docker-cli-to-kubectl/#docker-run](https://kubernetes.io/docs/user-guide/docker-cli-to-kubectl/#docker-run)