#! /bin/bash

# mongo
kubectl create -f db-pod.yml -f db-service.yml
# api_server
kubectl create -f web-pod.gce.yml -f web-rc.gce.yml -f web-service.yml
