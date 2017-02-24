#! /bin/bash

if [ $# -eq 1 ]
  then
    MODULE=$1
  else
    while : ; do
        echo -n "What's the name of the module you want to build? "
        read MODULE
        if [ ! -z $MODULE ]; then
                break
        fi
        echo -n "Let's try again. "
    done
fi

GIT_USER=Scalability-Engineering
GIT_PROJECT=code-scale-image-api-server
GIT_URL=https://github.com/${GIT_USER}/${GIT_PROJECT}.git
DEV_USER=$(echo $USER | tr '[:upper:]' '[:lower:]')
IMG_NAME=${DEV_USER}/${MODULE}
IMG_TAG=v1
IMG_NAME+=":${IMG_TAG}"

#echo ${GIT_URL}
#echo ${IMG_NAME}
git clone ${GIT_URL}

cd ${GIT_PROJECT}/${MODULE}
docker build --build-arg module=${MODULE} -t ${IMG_NAME} .
# TODO: launch bash only in dev-mode (bool arg)
docker run --rm -ti ${IMG_NAME} bash
