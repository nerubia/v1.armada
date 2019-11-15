#!/bin/bash
COMMIT_ID=$(cat .alfred/git-commit-id.txt)
COMMIT_SHA=$(cat .alfred/git-commit-short.txt)
ECR_URI=$(cat .alfred/ecr-uri.txt)
GIT_REPO_NAME=$(cat .alfred/git-repo-name.txt)
SLACK_URL=$(cat .alfred/slack-url.txt)

IMAGE_NAME=$GIT_REPO_NAME'-'$JOB_BASE_NAME':'$COMMIT_SHA

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
        "alt_text": "Pushing Image"
      },
      "fields": [
        { "type": "mrkdwn", "text": "*Stage:* Building" },
        { "type": "mrkdwn", "text": "*Build:* <'$BUILD_URL'/console|'$BUILD_NUMBER'>" },
        { "type": "mrkdwn", "text": "*Project:* '$GIT_REPO_NAME'" },
        { "type": "mrkdwn", "text": "*Branch:* '$JOB_BASE_NAME'" }
      ],
      "text": {
        "type": "mrkdwn",
        "text": "*Building* `'$IMAGE_NAME'.'${COMMIT_SHA}'` *for* <'${ECR_URI}'|ECR>"
      }
    }
  ]
}' &> /dev/null &

docker build -t $IMAGE_NAME -f Dockerfile.serve .
curl -X POST -s $SLACK_URL -d '{
  "type": "mrkdwn",
  "text": "[<'$BUILD_URL'/console|'$BUILD_NUMBER'>] *Done* building '$IMAGE_NAME'"
}' &> /dev/null &

$(aws ecr get-login --no-include-email --region ap-southeast-1)
ECR_FULL_IMAGE_TAG=$(echo $ECR_URI':'$JOB_BASE_NAME'.'$COMMIT_SHA)

curl -X POST -s $SLACK_URL -d '{
  "type": "mrkdwn",
  "text": "[<'$BUILD_URL'/console|'$BUILD_NUMBER'>] *Tagging* '$ECR_FULL_IMAGE_TAG'"
}' &> /dev/null &
docker tag $IMAGE_NAME $ECR_FULL_IMAGE_TAG

curl -X POST -s $SLACK_URL -d '{
  "type": "mrkdwn",
  "text": "[<'$BUILD_URL'/console|'$BUILD_NUMBER'>] *Pushing*\n '$ECR_FULL_IMAGE_TAG'"
}' &> /dev/null &
docker push $ECR_FULL_IMAGE_TAG

curl -X POST -s $SLACK_URL -d '{
  "type": "mrkdwn",
  "text": "[<'$BUILD_URL'/console|'$BUILD_NUMBER'>] *Removing* local image '$IMAGE_NAME'"
}' &> /dev/null &

# docker rmi $(docker images -f "dangling=true" -q)

