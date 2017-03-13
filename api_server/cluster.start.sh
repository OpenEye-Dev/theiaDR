#! /bin/bash

# Switch to the kubernetes dir where the yml files are
cd kubernetes

# create cluster
gcloud container clusters create cl1 --num-nodes=2

# mongo and api server
kubectl create -f db.yml -f grade.yml -f web.yml
