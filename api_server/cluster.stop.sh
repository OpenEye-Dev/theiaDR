#! /bin/bash

# Clean deploy, svc, rc and pods
kubectl delete deploy --all
kubectl delete svc --all
kubectl delete rc --all
kubectl delete pod --all

gcloud container clusters delete cl1
