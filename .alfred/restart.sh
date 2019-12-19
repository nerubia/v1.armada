#!/bin/bash
export REMOTE_ADDR=$CAG_AIRSIDE_ADDR_INTR
export REMOTE_USER=$CAG_AIRSIDE_ADDR_INTR
case $BRANCH_NAME in
  integration)
    export REMOTE_ADDR=$CAG_AIRSIDE_ADDR_INTR
    export REMOTE_USER=$CAG_AIRSIDE_USER_INTR
    ;;
  master)
    export REMOTE_ADDR=$CAG_AIRSIDE_ADDR_PROD
    export REMOTE_USER=$CAG_AIRSIDE_USER_PROD
    ;;
esac

COMMIT_SHA=$(cat .alfred/git-commit-short.txt)
ECR_URI=$(cat .alfred/ecr-uri.txt)
GIT_REPO_NAME=$(cat .alfred/git-repo-name.txt)

chmod 600 .alfred/access-key

echo "${ECR_URI}:${JOB_BASE_NAME}.${COMMIT_SHA}" > .alfred/restart-log.log

scp -i .alfred/access-key \
  -o UserKnownHostsFile=/dev/null \
  -o StrictHostKeyChecking=no \
  .env ${REMOTE_USER}@${REMOTE_ADDR}:.

ssh -i .alfred/access-key \
  -o UserKnownHostsFile=/dev/null \
  -o StrictHostKeyChecking=no \
  ${REMOTE_USER}@${REMOTE_ADDR} \
  """$(aws ecr get-login --no-include-email --region ap-southeast-1) &> /dev/null
  docker system prune -f
  docker pull ${ECR_URI}:${JOB_BASE_NAME}.${COMMIT_SHA}
  docker rm -f ${GIT_REPO_NAME}-${JOB_BASE_NAME} &> /dev/null
  docker run --name ${GIT_REPO_NAME}-${JOB_BASE_NAME} \
    --env-file .env \
    --network ksl-network \
    -p 8888:8888 \
    -it -d ${ECR_URI}:${JOB_BASE_NAME}.${COMMIT_SHA} &> /dev/null
  docker ps
  docker system prune -f
  """ >> .alfred/restart-log.log

docker images | grep -E $GIT_REPO_NAME'-'$JOB_BASE_NAME | awk -e '{print $3}'| xargs docker rmi -f

REMOTE_LOG=$(sed ':a;N;$!ba;s/\n/\\\\n/g' .alfred/restart-log.log)
curl -X POST -s $SLACK_URL -d '{
  "type": "mrkdwn",
  "text": "Pushed Image",
  "blocks": [
    { "type": "divider" },
    {
      "type": "section",
      "accessory": {
        "type": "image",
        "image_url": "https://greative-assets.s3.amazonaws.com/octocats/daftpunktocat-thomas.gif",
        "alt_text": "Pushed Image"
      },
      "fields": [
        { "type": "mrkdwn", "text": "*Stage:* Restarted containers" },
        { "type": "mrkdwn", "text": "*Build:* <'$BUILD_URL'console|'$BUILD_NUMBER'>" },
        { "type": "mrkdwn", "text": "*Project:* '$GIT_REPO_NAME'" },
        { "type": "mrkdwn", "text": "*Branch:* '$JOB_BASE_NAME'" }
      ],
      "text": {
        "type": "mrkdwn",
        "text": "*Restarted container with* `'$GIT_REPO_NAME'-'$JOB_BASE_NAME'.'$COMMIT_SHA'`"
      }
    }
  ]
}'
