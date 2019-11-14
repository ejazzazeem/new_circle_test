#!/bin/bash

set -e

IMG_NAME="img-adx-ui"
CT_NAME="ct-adx-ui"
NET_NAME="net-adx-dev"

docker build -t $IMG_NAME .

docker stop $CT_NAME || true
docker rm -fv $CT_NAME || true

docker network create $NET_NAME || true

docker run -d -p 4200:4200 --name=$CT_NAME --net=$NET_NAME $IMG_NAME
