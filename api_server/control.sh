#! /bin/bash

source ../gen-config

current_dir=$(basename "$PWD")

display_usage() {
   echo -e "Usage: \n abc \n"
}

### Commands ------------------------------

AVAILABLE_COMMANDS=(start stop restart resize get)

# start
start_cluster(){
   echo "Starting the cluster"

}

# stop
stop_cluster(){
   echo "Stopping the cluster"

}

# restart
restart_cluster(){
   echo "Restarting the cluster"

}

# resize
resize_deployment(){
   echo "Resizing the cluster"

}

# get 
GET_OPTIONS_LIST=(external-ip other)
get_options(){
   echo "Get cluster info"
  # if option in GET_OPTIONS_LIST, switch
  
  # else show usage + print GET_OPTIONS_LIST 

}

# -----------------------------------------

# Program logic

if [[ $# -gt 0 ]]
then
   echo "Looking for complete commands"
   echo "If not recognized, print usage"
   display_usage
else
   clear 
   # Display commands and let user choose
   while : ;
   do
       echo "Choose a command using its number:"
       for ((i=1;i < ${#AVAILABLE_COMMANDS[@]}; i++));
       do
           echo $i. ${AVAILABLE_COMMANDS[i]}
       done
       read choice
       if [[ $choice =~ ^[0-9]+$ && ${choice} -gt 0 && ${choice} -lt ${#AVAILABLE_COMMANDS[@]} ]]
       then
           CHOSEN_COMMAND=${AVAILABLE_COMMANDS[$choice]/.\//}
           break
       else
          clear
          echo -e "Unrecognized command. Type a number among the one shown below.\n"
       fi
   done   
  


   # DISPLAY SERVICES
   for option in ${SERVICES_PROD[*]};
   do
      echo "- $option"
   done
fi
