#!/bin/bash
export STAGE=dev
case $BRANCH_NAME in
  master)
    export STAGE=live
    ;;
esac

COMMIT_SHA=$(cat .alfred/git-commit-short.txt)
GIT_REPO_NAME=$(cat .alfred/git-repo-name.txt)
ROOT_DIR=$(pwd)

curl -X POST -s $SLACK_URL -d '{
  "type": "mrkdwn",
  "text": "Pushing Image",
  "blocks": [
    { "type": "divider" },
    {
      "type": "section",
      "accessory": {
        "type": "image",
        "image_url": "https://greative-assets.s3.amazonaws.com/octocats/hulatocat.gif",
        "alt_text": "Updating services"
      },
      "fields": [
        { "type": "mrkdwn", "text": "*Stage:* Updating lambdas" },
        { "type": "mrkdwn", "text": "*Build:* <'$BUILD_URL'/console|'$BUILD_NUMBER'>" },
        { "type": "mrkdwn", "text": "*Project:* '$GIT_REPO_NAME'" },
        { "type": "mrkdwn", "text": "*Branch:* '$JOB_BASE_NAME'" }
      ],
      "text": {
        "type": "mrkdwn",
        "text": "*Updating* services to reflect changes introduced by `'${COMMIT_SHA}'`"
      }
    }
  ]
}'

cp .env src/services/general
echo "export default '"$COMMIT_SHA"'" > version.ts
cd src/services/general

echo "STAGE="$STAGE >> .env

docker build -t ${GIT_REPO_NAME}-${JOB_BASE_NAME}-general .
docker run --rm --env-file .env ${GIT_REPO_NAME}-${JOB_BASE_NAME}-general
docker rmi ${GIT_REPO_NAME}-${JOB_BASE_NAME}-general