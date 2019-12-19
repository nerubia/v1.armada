#!/bin/bash

COMMIT_AUTHOR=$(cat .alfred/git-author.txt)
COMMIT_SHA=$(cat .alfred/git-commit-short.txt)

set -x
docker run --rm --name node-test \
  -v "$PWD/.alfred/parse.js:/usr/src/parse.js" \
  -v "$PWD/log/test-errors.json:/usr/src/test-errors.json" \
  node:alpine \
  node /usr/src/parse.js /usr/src/test-errors.json \
  "*${COMMIT_SHA}* • Build no. <${BUILD_URL}console|${BUILD_NUMBER}> by *${COMMIT_AUTHOR}*" >test-errors.json

set +x
curl -X POST -s $SLACK_URL -d @test-errors.json &>/dev/null &
