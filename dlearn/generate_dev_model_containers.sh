#!/bin/bash
echo "generating the containers which will contain the requisite models - for development. This means that they will NOT contain app.py"
for i in $( ls models ); do
  echo "found model:" $i
  # Run the container script in each folder
  if [ -f models/$i/Dockerfile ]; then
    echo "removing previously present Dockerfile..."
    rm models/$i/Dockerfile
  fi
  # copy Dockerfile and run docker build command
  cp Dockerfile models/$i
  cp app.py models/$i
  cd models/$i
  echo "Creating new container - " cs193s/tf-model-${i}_dev 
  docker build -t cs193s/tf-model-${i}_dev .
  rm app.py
  rm Dockerfile
  cd ../..
done

