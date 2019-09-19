#!/bin/bash
export STAGE=dev
case $BRANCH_NAME in
  master)
    export STAGE=live
    ;;
esac

export COMMIT_SHA=$(cat .alfred/git-commit-short.txt)
export GIT_REPO_NAME=$(cat .alfred/git-repo-name.txt)
export ROOT_DIR=$(pwd)

curl -X POST -s $SLACK_URL -d '{
  "type": "mrkdwn",
  "text": "Updating Lambdas",
  "blocks": [
    { "type": "divider" },
    {
      "type": "section",
      "accessory": {
        "type": "image",
        "image_url": "https://greative-assets.s3.amazonaws.com/octocats/hulatocat.gif",
        "alt_text": "Updating Lambdas"
      },
      "fields": [
        { "type": "mrkdwn", "text": "*Stage:* Updating Lambdas" },
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

sh .alfred/services/general.sh
curl -X POST -s $SLACK_URL -d '{
  "type": "mrkdwn",
  "text": "<'$BUILD_URL'/console|'$BUILD_NUMBER'>. *Updated all Lambdas!*"
}'