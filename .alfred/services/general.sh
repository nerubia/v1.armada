SERVICE_NAME=general

cp .env src/services/general
cd src/services/general

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
  "text": "'$PREFIX' ```docker run --env-file .env \n  --name '$IMAGE_NAME' \n  '$IMAGE_TAG' .```"
}'
docker run --env-file .env --name $IMAGE_NAME $IMAGE_TAG

docker images | grep -E $SERVICE_NAME | awk -e '{print $3}'
curl -X POST -s $SLACK_URL -d '{
  "type": "mrkdwn",
  "text": "'$PREFIX' `docker rmi '$IMAGE_TAG'`"
}'

# docker rm $IMAGE_NAME
docker rm $IMAGE_NAME
docker rmi $IMAGE_TAG -f
# docker images | grep -E none | awk -e '{print $3}'| xargs echo