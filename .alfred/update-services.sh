#!/bin/bash
set -x

export GIT_REPO_NAME=$(cat .alfred/git-repo-name.txt)
export COMMIT_SHA=$(cat .alfred/git-commit-short.txt)
export STAGE=$(cat .alfred/env.txt)
export ROOT_DIR=$(pwd)

EXIT_CODE=0

echo 'STAGE='$STAGE >>.env

set +x
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
        { "type": "mrkdwn", "text": "*Build:* <'$BUILD_URL'console|'$BUILD_NUMBER'>" },
        { "type": "mrkdwn", "text": "*Project:* '$GIT_REPO_NAME'" },
        { "type": "mrkdwn", "text": "*Branch:* '$JOB_BASE_NAME'" }
      ],
      "text": {
        "type": "mrkdwn",
        "text": "*Updating* services to reflect changes introduced by `'${COMMIT_SHA}'`"
      }
    }
  ]
}' &>/dev/null

set -x
cd $ROOT_DIR
sh .alfred/dir-services.sh
EXIT_CODE=$(($EXIT_CODE | $?))

# docker ps -a | grep -E Exited | awk -e '{print $1}' | xargs docker rm $GIT_REPO_NAME'-'$JOB_BASE_NAME
# docker images | grep -E none | awk -e '{print $3}'| xargs docker rmi $GIT_REPO_NAME'-'$JOB_BASE_NAME
set +x
curl -X POST -s $SLACK_URL -d '{
  "type": "mrkdwn",
  "text": "<'$BUILD_URL'console|'$BUILD_NUMBER'>. *Updated all Lambdas!*"
}' &>/dev/null

set -x
exit $EXIT_CODE
