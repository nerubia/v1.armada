import { HttpStatus } from '@g-six/kastle-router'
import { loadLocale } from '@g-six/swiss-knife'
import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda'
import getValue from 'lodash/get'
import pick from 'lodash/pick'
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

export const create: APIGatewayProxyHandler = async event => {
  const response: Response = {
    body: '',
    headers,
    statusCode: 500,
  }

  if (!event.body) {
    response.body = JSON.stringify({ error: HttpStatus.E_400 }, null, 2)
    response.statusCode = 400
    return response
  }

  let user

  try {
    const db = await connectDb()
    if (event.headers['kasl-key']) {
      user = await verifyUser(event.headers['kasl-key'], db)
    }

    if (!user || !user.id) {
      await closeDb(db)
      response.body = JSON.stringify({ error: HttpStatus.E_403 }, null, 2)
      response.statusCode = 403
      return response
    }

    const record = await createRecord(event, user.id, db)
    response.statusCode = 200

    response.body = JSON.stringify(
      {
        record,
        data: {
          user,
        },
      },
      null,
      2,
    )
  } catch (e) {
    if (e.status) response.statusCode = e.status
    const errors = {}
    if (e.errors) {
      const lang_file =
        [__dirname, 'lang', getValue(user, 'lang', 'en')].join('/') + '.yaml'
      const locale = loadLocale(lang_file)
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

export const list: APIGatewayProxyHandler = async event => {
  const response: Response = {
    body: '',
    headers,
    statusCode: 500,
  }

  const db = await connectDb()
  try {
    let data
    const kasl_key = event.headers && event.headers['kasl-key']
    if (kasl_key) {
      const user = await verifyUser(kasl_key, db)
      if (!user) {
        response.body = JSON.stringify(
          {
            error: HttpStatus.E_403,
          },
          null,
          2,
        )
        response.statusCode = 403
        return response
      }

      data = {
        user,
      }
    }

    const records = await listRecords(event, db)
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

  await closeDb(db)
  return response
}

export const retrieve = async (event: APIGatewayProxyEvent) => {
  const response: Response = {
    body: '',
    headers,
    statusCode: 500,
  }

  if (!event.pathParameters) {
    response.statusCode = 400
    return response
  }

  let user
  const db = await connectDb()
  const [category, slug] = event.pathParameters['identifier'].split('/', 2)
  const [record] = await retrieveRecord(slug, category, db)

  if (event.headers['kasl-key']) {
    user = await verifyUser(event.headers['kasl-key'], db)

    if (!user || !user.id) {
      await closeDb(db)
      response.body = JSON.stringify({ error: HttpStatus.E_403 }, null, 2)
      response.statusCode = 403
      return response
    }
  }

  await closeDb(db)

  response.statusCode = 200
  if (record) {
    response.body = JSON.stringify(
      {
        data: {
          user,
        },
        record,
      },
      null,
      2,
    )
  }
  return response
}

export const record: APIGatewayProxyHandler = async event => {
  if (event.httpMethod === 'PUT') {
    return await update(event)
  }

  return await retrieve(event)
}

export const update = async (event: APIGatewayProxyEvent) => {
  const response: Response = {
    body: '',
    headers,
    statusCode: 500,
  }

  if (!event.body || !event.pathParameters) {
    response.body = JSON.stringify({ error: HttpStatus.E_400 }, null, 2)
    response.statusCode = 400
    return response
  }

  let user

  try {
    const db = await connectDb()
    if (event.headers['kasl-key']) {
      user = await verifyUser(event.headers['kasl-key'], db)
    }

    if (!user || !user.id) {
      await closeDb(db)
      response.body = JSON.stringify({ error: HttpStatus.E_403 }, null, 2)
      response.statusCode = 403
      return response
    }

    const record = await updateRecord(
      parseInt(event.pathParameters['identifier'], 10),
      event.body,
      user.id,
      db,
    )
    response.statusCode = 200

    response.body = JSON.stringify(
      {
        record,
        data: {
          user,
        },
      },
      null,
      2,
    )

    await closeDb(db)
  } catch (e) {
    if (e.status) response.statusCode = e.status
    const errors = {}
    if (e.errors) {
      const lang_file =
        [__dirname, 'lang', getValue(user, 'lang', 'en')].join('/') + '.yaml'
      const locale = loadLocale(lang_file)
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
