#!/bin/bash

GIT_AUTHOR=$(cat .alfred/git-author.txt)
GIT_REPO_NAME=$(cat .alfred/git-repo-name.txt)
COMMIT_SHA=$(cat .alfred/git-commit-short.txt)
IMAGE_NAME=$GIT_REPO_NAME'-lint'
IMAGE_NAME_WITH_TAG=$IMAGE_NAME':'$COMMIT_SHA
CONTAINER_NAME=$GIT_REPO_NAME'-lint-'$COMMIT_SHA
EXIT_CODE=0

build() {
  docker build --no-cache --target essentials -t $IMAGE_NAME_WITH_TAG .
  EXIT_CODE=$(($EXIT_CODE | $?))
}

run() {
  docker run --rm \
    --name $CONTAINER_NAME $IMAGE_NAME_WITH_TAG \
    npm run l
  EXIT_CODE=$(($EXIT_CODE | $?))
}

cleanup() {
  docker rmi $IMAGE_NAME_WITH_TAG
}

set -x

build && run && cleanup

exit $EXIT_CODE
