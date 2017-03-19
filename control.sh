#! /bin/bash

# Load configs and commands
source ./project-config
source ./control-commands

current_dir=$(basename "$PWD")

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
       for ((i=1;i <= ${#AVAILABLE_COMMANDS[@]}; i++));
       do
           echo $i. ${AVAILABLE_COMMANDS[i-1]}
       done
       read choice
       if [[ $choice =~ ^[0-9]+$ && ${choice} -gt 0 && ${choice} -lt ${#AVAILABLE_COMMANDS[@]}+1 ]]
       then
           CHOSEN_COMMAND=${AVAILABLE_COMMANDS[$choice-1]/.\//}
           break
       else
          clear
          echo -e "Unrecognized command. Type a number among the one shown below.\n"
       fi
   done   
  
   # Calling command function
   cmd_$CHOSEN_COMMAND  
 
fi
