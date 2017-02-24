#! /bin/bash

GIT_USER=Scalability-Engineering
GIT_PROJECT=code-scale-image-api-server
GIT_URL=https://github.com/${GIT_USER}/${GIT_PROJECT}.git

git clone ${GIT_URL}
cd ${GIT_PROJECT}

# Create a list of folders to display
options=( $(find . -maxdepth 1 -type d) )

# If module name missing or wrong, show a menu and ask for input.
if [[ $# -eq 1  && " ${options[@]} " =~ " ./${1} " ]]
    then
        MODULE=$1
    else
        while : ;
        do
            echo "Choose a module using its number:"
            for ((i=1;i < ${#options[@]}; i++));
            do
                echo $i${options[i]}
            done
            read choice
            if [[ $choice =~ ^[0-9]+$ && ${choice} -gt 0 && ${choice} -lt ${#options[@]} ]]
            then
                MODULE=${options[$choice]/.\//}
                break
            fi
        done
fi


DEV_USER=$(echo $USER | tr '[:upper:]' '[:lower:]')
IMG_NAME=${DEV_USER}/${MODULE}
IMG_TAG=v1
IMG_NAME+=":${IMG_TAG}"

cd ${MODULE}
docker build --build-arg module=${MODULE} -t ${IMG_NAME} .
# TODO: launch bash only in dev-mode (bool arg)
docker run --rm -ti ${IMG_NAME} bash
