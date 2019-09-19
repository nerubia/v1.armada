cp .env src/services/general
cd src/services/general

echo "export default '"$COMMIT_SHA"'" > version.ts
echo "STAGE="$STAGE >> .env

docker build -t ${GIT_REPO_NAME}-${JOB_BASE_NAME}-general .
docker run --rm --env-file .env ${GIT_REPO_NAME}-${JOB_BASE_NAME}-general
docker rmi ${GIT_REPO_NAME}-${JOB_BASE_NAME}-general

curl -X POST -s $SLACK_URL -d '{
  "type": "mrkdwn",
  "text": "<'$BUILD_URL'/console|'$BUILD_NUMBER'>. *Updating* general services"
}'