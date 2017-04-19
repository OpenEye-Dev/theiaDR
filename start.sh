# Starts all the containers and mounts the api_server directory onto the api_server container
# gives bash access to it

echo 'starting mongodb container...'
docker run --name mongo -d --rm mongo mongod

echo 'starting torch container...'
docker run --name torch-server -d --rm tswedish/actdr

cd api_server
docker run --rm -it --link mongo:mongo --link torch-server -p 8080:8080 -v `pwd`:/src --name api-server cs193s/api_server_dev bash
