#! /bin/bash

# mongo
kubectl create -f db-pod.yml -f db-service.yml
# api_server
kubectl create -f web-pod.dh.yml -f web-rc.dh.yml -f web-service.yml
