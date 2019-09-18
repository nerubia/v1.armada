#!/bin/bash
GIT_REPO_NAME=$(cat .alfred/git-repo-name.txt)

docker rm -f ${GIT_REPO_NAME}-${JOB_BASE_NAME}-test &> /dev/null
docker build -t ${GIT_REPO_NAME}-${JOB_BASE_NAME}-test .
CONTAINER_ID=$(docker run --name ${GIT_REPO_NAME}-${JOB_BASE_NAME}-test -d ${GIT_REPO_NAME}-${JOB_BASE_NAME}-test)

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
        { "type": "mrkdwn", "text": "*Build:* <'$BUILD_URL'|'$BUILD_NUMBER'>" },
        { "type": "mrkdwn", "text": "*Project:* '$GIT_REPO_NAME'" },
        { "type": "mrkdwn", "text": "*Branch:* '$JOB_BASE_NAME'" }
      ]
    }
  ]
}'

docker rm -f ${GIT_REPO_NAME}-${JOB_BASE_NAME}-test
docker rmi ${GIT_REPO_NAME}-${JOB_BASE_NAME}-test &> /dev/null
