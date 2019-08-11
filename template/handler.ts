import { APIGatewayProxyHandler } from 'aws-lambda'

import { create as createToken } from './model'

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
  const token = await createToken()

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        token,
      },
      null,
      2,
    ),
  }
}
