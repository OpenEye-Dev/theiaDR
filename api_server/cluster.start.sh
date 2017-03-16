#! /bin/bash

# Switch to the kubernetes dir where the yml files are
cd kubernetes

# create cluster
gcloud container clusters create cl1 --num-nodes=2

# mongo, grade and api server
# sleep are added in order to give time to the db to start
sleep 1
kubectl create -f db.yml
sleep 5
kubectl create -f grade.yml
sleep 2
kubectl create -f web.yml
