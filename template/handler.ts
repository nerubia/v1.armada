import { APIGatewayProxyHandler } from 'aws-lambda'

import { create as createRecord } from './model'

export const list: APIGatewayProxyHandler = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `Life's a peach, eat more apples!`,
        input: event,
      },
      null,
      2,
    ),
  }
}

export const create: APIGatewayProxyHandler = async () => {
  const record = await createRecord()

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        record,
      },
      null,
      2,
    ),
  }
}
