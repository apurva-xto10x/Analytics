# Setting up scylla db

1.  docker run --name scylla-master -d scylladb/scylla

### for cluster do the following

2. docker run --name scylla-replica1 -d scylladb/scylla --seeds="$(docker inspect --format='{{ .NetworkSettings.IPAddress }}' scylla-master)"

3. docker run --name scylla-replica2 -d scylladb/scylla --seeds="$(docker inspect --format='{{ .NetworkSettings.IPAddress }}' scylla-master)"

# Setting up mongo

1. Go to https://cloud.mongodb.com, create a free account and spin up your cluster