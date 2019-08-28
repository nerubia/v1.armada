import { APIGatewayProxyEvent } from 'aws-lambda'
import { pick } from 'lodash'

import { create as createRecord, login as loginUser } from './model'
import { Response } from './types'

const headers = {
  'Access-Control-Allow-Origin': '*', // Required for CORS support to work
  'Access-Control-Expose-Headers': 'kasl-key',
  'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
}

export const list = async (event: APIGatewayProxyEvent) => {
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

export const create = async (event: APIGatewayProxyEvent) => {
  const response: Response = {
    body: '',
    headers,
    statusCode: 500,
  }

  try {
    const data = await createRecord(event)

    response.statusCode = 200

    response.body = JSON.stringify(
      {
        data,
      },
      null,
      2,
    )
  } catch (e) {
    response.statusCode = e.status
  }

  return response
}

export const login = async (event: APIGatewayProxyEvent) => {
  const response: Response = {
    body: '',
    headers,
    statusCode: 500,
  }

  try {
    const results = await loginUser(event)
    response.statusCode = 200
    response.headers['kasl-key'] = results['kasl-key']

    response.body = JSON.stringify(
      {
        data: pick(results, ['id', 'email']),
      },
      null,
      2,
    )
  } catch (e) {
    response.body = JSON.stringify(
      {
        error: e.message,
      },
      null,
      2,
    )
    if (e.status) response.statusCode = e.status
  }

  return response
}
