import { APIGatewayProxyHandler } from 'aws-lambda'

import { create as createRecord } from './model'

const headers = {
  'Access-Control-Allow-Origin': '*', // Required for CORS support to work
  'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
}

export const list: APIGatewayProxyHandler = async event => {
  return {
    statusCode: 200,
    headers,
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
    headers,
    body: JSON.stringify(
      {
        record,
      },
      null,
      2,
    ),
  }
}
