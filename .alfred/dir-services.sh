#!/bin/bash
set -x

IMAGE_NAME=''
IMAGE_TAG=''
CONTAINER_NAME=''
PREFIX=''
SERVICE_NAME=''
EXIT_CODE=0

build() {
  set +x
  curl -X POST -s $SLACK_URL -d '{
    "type": "mrkdwn",
    "text": "'$PREFIX' `docker build --no-cache -t '$IMAGE_TAG' .`"
  }' &>/dev/null

  set -x
  docker build --no-cache -t $IMAGE_TAG .
  EXIT_CODE=$(($EXIT_CODE | $?))
}

run() {
  set +x
  curl -X POST -s $SLACK_URL -d '{
    "type": "mrkdwn",
    "text": "'$PREFIX' ```docker run --env-file .env \n  --name '$IMAGE_NAME' \n  '$IMAGE_TAG' .```"
  }' &>/dev/null

  set -x
  docker run --rm --env-file .env --name $CONTAINER_NAME $IMAGE_TAG
  EXIT_CODE=$(($EXIT_CODE | $?))
}

cleanup() {
  set +x
  curl -X POST -s $SLACK_URL -d '{
    "type": "mrkdwn",
    "text": "'$PREFIX' `docker rmi '$IMAGE_TAG'`"
  }' &>/dev/null

  set -x
  docker rmi $IMAGE_TAG
  EXIT_CODE=$(($EXIT_CODE | $?))
}

for dir in $(ls -d src/services/*/); do
  SERVICE_NAME=$(basename $dir)

  cp .env $dir
  cd $dir

  echo "export default '"$COMMIT_SHA"'" >version.ts

  IMAGE_NAME=${GIT_REPO_NAME}'-'$SERVICE_NAME
  IMAGE_TAG=$IMAGE_NAME':'$COMMIT_SHA
  CONTAINER_NAME=$IMAGE_NAME'-'$COMMIT_SHA
  PREFIX='[<'$BUILD_URL'console|'$BUILD_NUMBER':'$COMMIT_SHA'>]'

  set -x
  build && run && cleanup

  cd $ROOT_DIR
done

exit $EXIT_CODE
