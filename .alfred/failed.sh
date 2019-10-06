#!/bin/bash
curl -X POST -s $SLACK_URL -d '{
  "type": "mrkdwn",
  "text": "Failed deployment",
  "blocks": [
    { "type": "divider" },
    {
      "type": "section",
      "accessory": {
        "type": "image",
        "image_url": "https://greative-assets.s3.amazonaws.com/octocats/octocat.gif",
        "alt_text": "Octocat walks out"
      },
      "text": {
        "type": "mrkdwn",
        "text": "*DMD*\n>Please check your pipeline script oi!\n\n<'$BUILD_URL'|Build #'$BUILD_NUMBER'>"
      }
    }
  ]
}' > /dev/null
