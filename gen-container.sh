#! /bin/bash

source ./gen-config

current_dir=$(basename "$PWD")

if [[ current_dir == ${GIT_PROJECT} ]]
then
    echo "Repository already downloaded."
else
    if [[ ! -d ./${GIT_PROJECT} ]]
    then
        git clone ${GIT_URL}
    fi
    cd ${GIT_PROJECT}
fi

# Create a list of folders to display
GIT_DIRECTORIES=( $(find . -maxdepth 1 -type d) )

# --------------------------------------------------
# Defaults options
DEV_MODE=false
LIST_COMMANDS=false

if [[ $# -gt 0 ]]
then
   for option in "$@";
   do

      if [[ $option == '-d' || $option == '--dev' ]]
      then
          DEV_MODE=true
      fi
      
      if [[ $option == '-l' || $option == '--list' ]]
      then
          LIST_COMMANDS=true
      fi

   done
fi

# --------------------------------------------------

# If module name missing or wrong, show a menu and ask for input.

if [[ " ${GIT_DIRECTORIES[@]} " =~ " ./${1} " ]]
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

if [[ $LIST_COMMANDS == true ]]
then
    echo "docker build --build-arg module=${MODULE} -t ${IMG_NAME} ."
    if [[ $DEV_MODE == true ]]
    then
        echo "docker run --rm -ti ${IMG_NAME} bash"
    else
        echo "docker run --rm  ${IMG_NAME}"
    fi
else
    docker build --build-arg module=${MODULE} -t ${IMG_NAME} .

    if [[ $DEV_MODE == true ]]
    then
        docker run --rm -ti ${IMG_NAME} bash
    else
        docker run --rm  ${IMG_NAME}
    fi
fi
