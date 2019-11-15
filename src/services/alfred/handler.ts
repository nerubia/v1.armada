import { HttpStatus } from '@g-six/kastle-router'
import { APIGatewayProxyHandler } from 'aws-lambda'
import pick from 'lodash/pick'
import getEnv from './config'
import { access } from './model'
import { list } from './models/server'

import { Response } from './types'

const headers = {
  'Access-Control-Allow-Origin': '*', // Required for CORS support to work
  'Access-Control-Allow-Headers': 'kasl-key',
  'Access-Control-Expose-Headers': 'kasl-key',
  'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
  'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
}

export const oauth: APIGatewayProxyHandler = async event => {
  const response: Response = {
    body: '{}',
    headers,
    statusCode: 500,
  }

  if (!event.queryStringParameters || !event.queryStringParameters['code']) {
    const error = HttpStatus.E_403
    response.body = JSON.stringify({ error }, null, 2)
    response.statusCode = 403
    return response
  }

  const code = event.queryStringParameters['code']

  try {
    const record = await access(code)
    const config = getEnv()
    response.statusCode = 302
    response.headers['Location'] = `${decodeURIComponent(
      config['SLACK_REDIRECT_URL'],
    )}?incoming=${encodeURIComponent(record.incoming_webhook.url)}`

    // This is a workaround for now.
    // APIGatewayProxyHandler requires return but
    // Istanbul can't reach this code after the header
    // redirect code above
    /* istanbul ignore next */
    return response
  } catch (e) {
    response.body = JSON.stringify(
      {
        message: e.stack,
        ...pick(e, ['error', 'message']),
      },
      null,
      2,
    )
  }

  return response
}

export const listServers: APIGatewayProxyHandler = async () => {
  const response: Response = {
    body: '{}',
    headers,
    statusCode: 500,
  }

  // if (!event.queryStringParameters || !event.queryStringParameters['code']) {
  //   const error = HttpStatus.E_403
  //   response.body = JSON.stringify({ error }, null, 2)
  //   response.statusCode = 403
  //   return response
  // }

  // const code = event.queryStringParameters['code']

  try {
    const records = await list()

    // This is a workaround for now.
    // APIGatewayProxyHandler requires return but
    // Istanbul can't reach this code after the header
    // redirect code above
    /* istanbul ignore next */
    response.body = JSON.stringify(
      {
        records,
      },
      null,
      2,
    )
    response.statusCode = 200
  } catch (e) {
    response.body = JSON.stringify(
      {
        message: e.stack,
        ...pick(e, ['error', 'message']),
      },
      null,
      2,
    )
  }

  return response
}
