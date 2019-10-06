#!/bin/bash
GIT_AUTHOR=$(cat .alfred/git-author.txt)
GIT_REPO_NAME=$(cat .alfred/git-repo-name.txt)
COMMIT_SHA=$(cat .alfred/git-commit-short.txt)
CONTAINER_NAME=$GIT_REPO_NAME'-'$COMMIT_SHA'-test'

REPORT=$PWD'/log:/var/log/jest'

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
}' &> /dev/null &

docker build --no-cache --target essentials -t $CONTAINER_NAME . > ./docker.log

docker run --rm -t -v $REPORT \
  --name $CONTAINER_NAME $CONTAINER_NAME \
  npm t -- --no-color --json --outputFile=/var/log/jest/test-errors.json --silent > ./test-results.log

curl -X POST -s $SLACK_URL -o curl-output.log -d '{
  "type": "mrkdwn",
  "text": "[<'$BUILD_URL'console|'$BUILD_NUMBER'>] *Removing test containers* '$CONTAINER_NAME'"
}' &> /dev/null &
