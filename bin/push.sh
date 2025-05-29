#!/bin/bash -e

export DOCKER_BUILDKIT=1

# install qemu multi-architecture
docker run --rm --privileged tonistiigi/binfmt --install all

docker buildx rm bullmq-board-builder || true

docker buildx create --use --name bullmq-board-builder
docker buildx build --no-cache --pull --platform linux/amd64,linux/arm64 -t xjrcode/bullmq-board:$1 -t xjrcode/bullmq-board:latest --push .
docker buildx rm bullmq-board-builder
