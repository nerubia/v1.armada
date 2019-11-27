import {
  HttpStatus,
  KastleResponseHeaders as headers,
} from '@g-six/kastle-router'
import { APIGatewayProxyEvent } from 'aws-lambda'
import Axios from 'axios'
import { pick } from 'lodash'
import version from './version'

import {
  connectDb,
  closeDb,
  create as createRecord,
  login as loginUser,
  verifyClient,
} from './model'
import { Response } from './types'

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

export const create = async (event: APIGatewayProxyEvent) => {
  let response: Response = {
    body: '',
    headers,
    statusCode: 500,
  }

  if (!event.body || event.body === '{}') {
    return errorResponse(400, HttpStatus.E_400)
  }

  const { email, password } = JSON.parse(event.body)
  if (!email || !password) {
    return errorResponse(400, HttpStatus.E_400)
  }

  const db = await connectDb()

  if (event.headers['client-id'] && event.headers['client-secret']) {
    if (
      event.headers['client-id'] !== process.env.CLIENT_ID ||
      event.headers['client-secret'] !== process.env.CLIENT_SECRET
    ) {
      if (
        !(await verifyClient(
          event.headers['client-id'],
          event.headers['client-secret'],
          db,
        ))
      ) {
        await closeDb(db)
        return errorResponse(401, HttpStatus.E_401)
      }
    }
  } else {
    await closeDb(db)
    return errorResponse(401, HttpStatus.E_401)
  }

  try {
    const payload = JSON.parse(event.body)
    const data = await createRecord(payload, db)

    response.statusCode = 200

    response.body = JSON.stringify(
      {
        data,
      },
      null,
      2,
    )
  } catch (e) {
    response = errorResponse(e.status, e.stack)
  }

  await closeDb(db)
  return response
}

export const login = async (event: APIGatewayProxyEvent) => {
  let response: Response = {
    body: '',
    headers,
    statusCode: 500,
  }

  if (!event.body || event.body === '{}') {
    return errorResponse(400, HttpStatus.E_400)
  }

  const { email, password } = JSON.parse(event.body)
  if (!email || !password) {
    return errorResponse(400, HttpStatus.E_400)
  }

  try {
    const db = await connectDb()
    const results = await loginUser(email, password, db)
    response.statusCode = 200
    response.headers['kasl-key'] = results['kasl-key']

    response.body = JSON.stringify(
      {
        data: pick(results, ['id', 'email']),
      },
      null,
      2,
    )
    await closeDb(db)
  } catch (e) {
    Axios.post(
      `https://hooks.slack.com/services${process.env.NOTIFICATIONS_URI}`,
      {
        type: 'mrkdwn',
        text: ['```', e.toString(), '```'].join('\n\n'),
      },
    )
    response = errorResponse(e.status, e.message)
  }

  return response
}
