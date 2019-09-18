import { APIGatewayProxyHandler } from 'aws-lambda'
import fs from 'fs'
import { promisify } from 'util'
import 'source-map-support/register'

export const sitrep: APIGatewayProxyHandler = async event => {
  const readFileAsync = promisify(fs.readFile)
  const json = await readFileAsync(__dirname + '/version.json', 'utf8')
  const fingerprint = JSON.parse(json)

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `Life's a peach, eat more apples!`,
        fingerprint,
        input: event,
      },
      null,
      2,
    ),
  }
}
