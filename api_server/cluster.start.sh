#! /bin/bash

# Switch to the kubernetes dir where the yml files are
cd kubernetes

# create cluster
if [ $1 == 'restart' ]
then 
	echo "restarting cluster"
        kubectl delete deploy --all
        kubectl delete svc --all
        kubectl delete rc --all
        kubectl delete pod --all
else
	echo "starting fresh clusters"
	gcloud container clusters create cl1 --num-nodes=2
fi

# mongo, grade and api server
# sleep are added in order to give time to the db to start
sleep 1
kubectl create -f db.yml
sleep 5
kubectl create -f grade.yml
sleep 2
kubectl create -f web.yml
