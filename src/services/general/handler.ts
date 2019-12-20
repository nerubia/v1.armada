import { HttpStatus } from '@g-six/kastle-router'
import { loadLocale } from '@g-six/swiss-knife'
import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda'
import getValue from 'lodash/get'
import pick from 'lodash/pick'
import version from './version'
import {
  connectDb,
  closeDb,
  create as createRecord,
  list as listRecords,
  retrieve as retrieveRecord,
  update as updateRecord,
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

const errorResponse = (code: number, error: string, errors?: {}): Response => ({
  body: JSON.stringify(
    {
      error,
      errors,
    },
    null,
    2,
  ),
  headers,
  statusCode: code || 500,
})

export const index = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `Life's a peach, eat more apples!`,
        version,
      },
      null,
      2,
    ),
  }
}
