#!/bin/bash

GIT_AUTHOR=$(cat .alfred/git-author.txt)
GIT_REPO_NAME=$(cat .alfred/git-repo-name.txt)
COMMIT_SHA=$(cat .alfred/git-commit-short.txt)
IMAGE_NAME=$GIT_REPO_NAME'-test'
IMAGE_NAME_WITH_TAG=$IMAGE_NAME':'$COMMIT_SHA
CONTAINER_NAME=$GIT_REPO_NAME'-test-'$COMMIT_SHA
EXIT_CODE=0

REPORT=$PWD'/log:/var/log/jest'

build() {
  set +x
  curl -X POST -s -o curl-output.log $SLACK_URL -d '{
    "type": "mrkdwn",
    "text": "Testing Image",
    "blocks": [
      { "type": "divider" },
      {
        "type": "section",
        "accessory": {
          "type": "image",
          "image_url": "https://greative-assets.s3.amazonaws.com/octocats/maxtocat.gif",
          "alt_text": "Testing Image"
        },
        "fields": [
          { "type": "mrkdwn", "text": "*Stage:* Testing"git  },
          { "type": "mrkdwn", "text": "*Build:* <'$BUILD_URL'console|'$BUILD_NUMBER'>" },
          { "type": "mrkdwn", "text": "*Project:* '$GIT_REPO_NAME'" },
          { "type": "mrkdwn", "text": "*Branch:* '$JOB_BASE_NAME'" }
        ],
        "text": {
          "type": "mrkdwn",
          "text": "*Running tests for* `'$JOB_BASE_NAME'.'$COMMIT_SHA'`"
        }
      }
    ]
  }' &>/dev/null &

  set -x
  docker build --no-cache --target essentials -t $IMAGE_NAME_WITH_TAG .
  EXIT_CODE=$(($EXIT_CODE | $?))
}

run() {
  docker run --rm -v $REPORT \
    --name $CONTAINER_NAME $IMAGE_NAME_WITH_TAG \
    npm t -- --no-color --json --outputFile=/var/log/jest/test-errors.json
  EXIT_CODE=$(($EXIT_CODE | $?))
}

cleanup() {
  set +x
  curl -X POST -s $SLACK_URL -o curl-output.log -d '{
    "type": "mrkdwn",
    "text": "[<'$BUILD_URL'console|'$BUILD_NUMBER'>] *Removing test containers* '$IMAGE_NAME'"
  }' &>/dev/null &

  set -x
  docker rmi $IMAGE_NAME_WITH_TAG
}

set -x

build && run && cleanup

exit $EXIT_CODE
