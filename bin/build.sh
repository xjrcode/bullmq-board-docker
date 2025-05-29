#!/bin/bash -e

export DOCKER_BUILDKIT=1

docker build -t xjrcode/bullmq-board:$1 .