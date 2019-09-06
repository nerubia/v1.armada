import { loadLocale } from '@g-six/swiss-knife'
import { APIGatewayProxyHandler } from 'aws-lambda'
import getValue from 'lodash/get'
import pick from 'lodash/pick'

import {
  closeDb,
  create as createRecord,
  list as listRecords,
  retrieve as retrieveRecord,
  verifyUser,
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
    let data
    const kasl_key = event.headers && event.headers['kasl-key']
    if (kasl_key) {
      data = {
        user: {
          id: await verifyUser(kasl_key),
        },
      }
      await closeDb()
    }

    const records = await listRecords(event)
    response.statusCode = 200

    response.body = JSON.stringify(
      {
        data,
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
    const errors = {}
    if (e.errors) {
      const locale = loadLocale(__dirname + '/jp.yaml')
      for (const key in e.errors) {
        errors[key] = getValue(
          locale,
          `${key}.${e.errors[key]}`,
          `${key}.${e.errors[key]}`,
        )
      }
    }

    response.body = JSON.stringify(
      {
        errors,
        message: e.stack,
        ...pick(e, ['error', 'message']),
      },
      null,
      2,
    )
  }

  return response
}
