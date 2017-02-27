#! /bin/bash

GIT_USER=Scalability-Engineering
GIT_PROJECT=code-scale-image-api-server
GIT_URL=https://github.com/${GIT_USER}/${GIT_PROJECT}.git

git clone ${GIT_URL}
cd ${GIT_PROJECT}

# Create a list of folders to display
GIT_DIRECTORIES=( $(find . -maxdepth 1 -type d) )


# --------------------------------------------------
# Defaults options
DEV_MODE=false

if [[ $# -gt 0 ]]
then
   for option in "$@";
   do
      if [[ $option == '-d' || $option == '--dev' ]]
      then
          DEV_MODE=true
      fi
   done
fi

# --------------------------------------------------

# If module name missing or wrong, show a menu and ask for input.
if [[ " ${GIT_DIRECTORIES[@]} " =~ " ./${1} " ]]
    then
        MODULE=$1
    else
        while : ;
        do
            echo "Choose a module using its number:"
            for ((i=1;i < ${#GIT_DIRECTORIES[@]}; i++));
            do
                echo $i${GIT_DIRECTORIES[i]}
            done
            read choice
            if [[ $choice =~ ^[0-9]+$ && ${choice} -gt 0 && ${choice} -lt ${#GIT_DIRECTORIES[@]} ]]
            then
                MODULE=${GIT_DIRECTORIES[$choice]/.\//}
                break
            fi
        done
fi


DEV_USER=$(echo $USER | tr '[:upper:]' '[:lower:]')
IMG_NAME=${DEV_USER}/${MODULE}
IMG_TAG=0.1
IMG_NAME+=":${IMG_TAG}"

cd ${MODULE}
docker build --build-arg module=${MODULE} -t ${IMG_NAME} .

if $DEV_MODE;
then
    docker run --rm -ti ${IMG_NAME} bash
else
    docker run --rm  ${IMG_NAME}
