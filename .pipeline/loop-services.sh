#!/bin/bash
set -x

SERVICE_NAME=''
EXIT_CODE=0
ROOT_DIR=$(pwd)

build() {
  docker build --no-cache -t $SERVICE_NAME .
  EXIT_CODE=$(($EXIT_CODE | $?))
}

run() {
  docker run --rm --env-file .env $SERVICE_NAME
  EXIT_CODE=$(($EXIT_CODE | $?))
}

for dir in $(ls -d src/services/*/); do
  SERVICE_NAME=$(basename $dir)
  echo "Service name: ${SERVICE_NAME}"

  cp .env $dir
  cd $dir

  echo "export default '"${CODEBUILD_RESOLVED_SOURCE_VERSION}"'" >version.ts

  build && run

  cd $ROOT_DIR
done

exit $EXIT_CODE
