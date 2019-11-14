#!/bin/bash
set -x

# This script pulls down the docker image and runs it. This is meant for dev and QA environments only.
# The following arguments are expected:
#   docker-tag - expected format is 0.1-b123 or feature-SEHR-332-b11
#   environment number, for main dev environment expect 0 for dev1 1 for qa2 2 and so forth
# This script assumes the user running has the following set up:
# 1. Docker commands are allowed. (the user is in the docker group)
# 2. The AWS command line tools are installed and configured (aws configure) for this user.

DOCKER_REPO=055638961298.dkr.ecr.us-east-1.amazonaws.com
DOCKER_IMAGE=stella/healthenet/ui
DOCKER_NETWORK=iqhd

if [ $2 ]; then
    DOCKER_TAG=$1
    HOST_PORT=$((80 + $2))
    DOCKER_NETWORK=healthenet_$2
    CONTAINER_NAME=ct-healthenet-new-ui-$DOCKER_NETWORK
    NODE_ENV=$3

    eval `$(aws ecr get-login --no-include-email --region us-east-1)`
    docker pull $DOCKER_REPO/$DOCKER_IMAGE:$DOCKER_TAG
    # Next stop/rm/network lines can't fail the script so || true was appended
    docker stop $CONTAINER_NAME || true
    docker rm -fv $CONTAINER_NAME || true
    docker network create $DOCKER_NETWORK || true
    docker run -d -p $HOST_PORT:80 --restart=unless-stopped --name=$CONTAINER_NAME --net=$DOCKER_NETWORK --net-alias=healthenet-ui -e "ENV_CONFIG=$3" $DOCKER_REPO/$DOCKER_IMAGE:$DOCKER_TAG
else
    echo "2 arguments required"
    exit 1
fi