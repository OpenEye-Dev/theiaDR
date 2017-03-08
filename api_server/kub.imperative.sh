#! /bin/bash

NAMESPACE=front-end
API_SERVER_IMG=mmmarco/api_server:1.0
MONGO_IMG=mongo:3.0

kubectl create ns ${NAMESPACE}
kubectl run api-pod --namespace=${NAMESPACE} --image=${API_SERVER_IMG} --port=80
kubectl run mongo --namespace=${NAMESPACE} --image=${MONGO_IMG} --port=80
