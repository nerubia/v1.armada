#!/bin/bash
GIT_REPO_NAME=$(cat .alfred/git-repo-name.txt)
IMAGE_NAME=$GIT_REPO_NAME'-'$JOB_BASE_NAME'-test'
COMMIT_SHA=$(cat .alfred/git-commit-short.txt)
SLACK_URL=$(cat .alfred/slack-url.txt)
WORKDIR=$PWD
curl -X POST -s $SLACK_URL -d '{
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
        { "type": "mrkdwn", "text": "*Stage:* Testing" },
        { "type": "mrkdwn", "text": "*Build:* <'$BUILD_URL'/console|'$BUILD_NUMBER'>" },
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
docker build -t $IMAGE_NAME . > build.log
docker run --rm -it --name -v $WORKDIR/.alfred:/logs ${IMAGE_NAME} ${IMAGE_NAME} npm t -- --no-color --outputFile=$/logs/delete-me.json

curl -X POST -s $SLACK_URL -d '{
  "type": "mrkdwn",
  "text": "[<'$BUILD_URL'/console|'$BUILD_NUMBER'>] *Removing test containers* '$IMAGE_NAME'"
}' &> /dev/null &
# docker rmi $(docker images -f "dangling=true" -q) $IMAGE_NAME -f
