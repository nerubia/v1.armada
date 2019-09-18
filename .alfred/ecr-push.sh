#!/bin/bash
COMMIT_ID=$(cat .alfred/git-commit-id.txt)
COMMIT_SHA=$(cat .alfred/git-commit-short.txt)
ECR_URI=$(cat .alfred/ecr-uri.txt)
GIT_REPO_NAME=$(cat .alfred/git-repo-name.txt)

BUILD_LINK="<'$BUILD_URL'|Build #'$BUILD_NUMBER'>"

echo "export default version = '"$COMMIT_SHA"'" > src/services/general/version.ts

docker rm -f ${GIT_REPO_NAME}-${JOB_BASE_NAME} &> /dev/null
docker rmi ${GIT_REPO_NAME}-${JOB_BASE_NAME} &> /dev/null
docker build -t ${GIT_REPO_NAME}-${JOB_BASE_NAME} -f Dockerfile.serve .

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
        { "type": "mrkdwn", "text": "*Stage:* Pushing to ECR" },
        { "type": "mrkdwn", "text": "*Build:* <'$BUILD_URL'|'$BUILD_NUMBER'>" },
        { "type": "mrkdwn", "text": "*Project:* '$GIT_REPO_NAME'" },
        { "type": "mrkdwn", "text": "*Branch:* '$JOB_BASE_NAME'" }
      ],
      "text": {
        "type": "mrkdwn",
        "text": "*Pushing* `'${COMMIT_SHA}'` *to* <'${ECR_URI}'|ECR>"
      }
    }
  ]
}'

$(aws ecr get-login --no-include-email --region ap-southeast-1)
docker tag ${GIT_REPO_NAME}-${JOB_BASE_NAME} ${ECR_URI}':'${JOB_BASE_NAME}'.'${COMMIT_SHA}
ECR_FULL_IMAGE_TAG=$(echo $ECR_URI':'$JOB_BASE_NAME'.'$COMMIT_SHA)
docker push $ECR_FULL_IMAGE_TAG
echo 'Pushed '$ECR_FULL_IMAGE_TAG
