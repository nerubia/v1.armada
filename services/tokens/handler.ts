import { APIGatewayProxyHandler } from 'aws-lambda'

import { create as createToken, list as listTokens } from './model'

import { Response } from './types'

const headers = {
  'Access-Control-Allow-Origin': '*', // Required for CORS support to work
  'Access-Control-Expose-Headers': 'kasl-key',
  'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
}

export const list: APIGatewayProxyHandler = async event => {
  let response: Response = {
    body: '',
    headers,
    statusCode: 500,
  }

  try {
    const data = await listTokens(event)

    response.statusCode = 200

    response.body = JSON.stringify(
      {
        data,
      },
      null,
      2,
    )
  } catch (e) {
    if (e.status) {
      response.statusCode = e.status
    }

    response.body = JSON.stringify(
      {
        message: e.stack,
      },
      null,
      2,
    )
  }

  return response
}

export const create: APIGatewayProxyHandler = async event => {
  let response: Response = {
    body: '',
    headers,
    statusCode: 500,
  }

  try {
    const data = await createToken(event)

    response.statusCode = 200

    response.body = JSON.stringify(
      {
        data,
      },
      null,
      2,
    )
  } catch (e) {
    if (e.status) {
      response.statusCode = e.status
    }

    response.body = JSON.stringify(
      {
        message: e.stack,
      },
      null,
      2,
    )
  }

  return response
}
