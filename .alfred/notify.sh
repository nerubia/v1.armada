#!/bin/bash
SLACK_URL=$(cat .alfred/slack-url.txt)

docker run --rm -t --name node-test \
  -v "$PWD/.alfred/parse.js:/usr/src/parse.js" \
  -v "$PWD/log/test-errors.json:/usr/src/test-errors.json" \
  node:alpine node /usr/src/parse.js /usr/src/test-errors.json > test-errors.json

curl -X POST -s $SLACK_URL -d @test-errors.json

