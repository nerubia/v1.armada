import { APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import version from './version'

export const sitrep: APIGatewayProxyHandler = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `Life's a peach, eat more apples!`,
        version,
        input: event,
      },
      null,
      2,
    ),
  }
}
