import { APIGatewayProxyHandler } from 'aws-lambda'

import {
  create as createRecord,
  list as listRecords,
  retrieve as retrieveRecord,
} from './model'

import { Response } from './types'

const headers = {
  'Access-Control-Allow-Origin': '*', // Required for CORS support to work
  'Access-Control-Allow-Headers': 'kasl-key',
  'Access-Control-Expose-Headers': 'kasl-key',
  'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
  'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
}

export const list: APIGatewayProxyHandler = async event => {
  const response: Response = {
    body: '',
    headers,
    statusCode: 500,
  }

  try {
    const records = await listRecords(event)
    response.statusCode = 200

    response.body = JSON.stringify(
      {
        records,
      },
      null,
      2,
    )
  } catch (e) {
    if (e.status) response.statusCode = e.status

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

export const retrieve: APIGatewayProxyHandler = async event => {
  const record = await retrieveRecord(event)
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

export const create: APIGatewayProxyHandler = async event => {
  const response: Response = {
    body: '',
    headers,
    statusCode: 500,
  }

  try {
    const record = await createRecord(event)
    response.statusCode = 200

    response.body = JSON.stringify(
      {
        record,
      },
      null,
      2,
    )
  } catch (e) {
    if (e.status) response.statusCode = e.status

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
