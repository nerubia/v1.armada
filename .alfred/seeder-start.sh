#!/bin/bash
GIT_REPO_NAME=$(cat .alfred/git-repo-name.txt)
COMMIT_SHA=$(cat .alfred/git-commit-short.txt)
IMAGE_TAG=$GIT_REPO_NAME'-seeder:'$COMMIT_SHA

curl -X POST -s $SLACK_URL -d '{
  "type": "mrkdwn",
  "text": "Building Image",
  "blocks": [
    { "type": "divider" },
    {
      "type": "section",
      "accessory": {
        "type": "image",
        "image_url": "https://greative-assets.s3.amazonaws.com/octocats/octocat-wave.gif",
        "alt_text": "Octocat"
      },
      "fields": [
        { "type": "mrkdwn", "text": "*Stage:* Seeding..." },
        { "type": "mrkdwn", "text": "*Build:* <'$BUILD_URL'console|'$BUILD_NUMBER'>" },
        { "type": "mrkdwn", "text": "*Project:* '$GIT_REPO_NAME'" },
        { "type": "mrkdwn", "text": "*Branch:* '$JOB_BASE_NAME'" }
      ],
      "text": {
        "type": "mrkdwn",
        "text": "*Commit SHA:* \n ```'${COMMIT_SHA}'```"
      }
    }
  ]
}' >/dev/null

set -x

cat .env

docker build -f Dockerfile.seeder --no-cache -t $IMAGE_TAG .

docker rmi $IMAGE_TAG
