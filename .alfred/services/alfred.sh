SERVICE_NAME=alfred

cp .env src/services/alfred
cd src/services/alfred

echo "export default '"$COMMIT_SHA"'" > version.ts

IMAGE_NAME=${GIT_REPO_NAME}'-'${JOB_BASE_NAME}'-'$SERVICE_NAME
PREFIX='[<'$BUILD_URL'/console|'$BUILD_NUMBER':'$COMMIT_SHA'>]'

IMAGE_TAG=$IMAGE_NAME':'$COMMIT_SHA
curl -X POST -s $SLACK_URL -d '{
  "type": "mrkdwn",
  "text": "'$PREFIX' `docker build -t '$IMAGE_TAG' .`"
}'
docker build -t $IMAGE_TAG .

curl -X POST -s $SLACK_URL -d '{
  "type": "mrkdwn",
  "text": "'$PREFIX' ```docker run --env-file .env \n  --name '$IMAGE_NAME' \n  '$IMAGE_NAME' .```"
}'
docker run --env-file .env --name $IMAGE_NAME $IMAGE_TAG

docker images | grep -E $SERVICE_NAME | awk -e '{print $3}'
curl -X POST -s $SLACK_URL -d '{
  "type": "mrkdwn",
  "text": "'$PREFIX' `docker rmi '$IMAGE_TAG'`"
}'

docker rm $IMAGE_NAME