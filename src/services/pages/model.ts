import { HttpStatus } from '@g-six/kastle-router'
import { invalidRequestReducer } from '@g-six/swiss-knife'
import { APIGatewayProxyEvent } from 'aws-lambda'
import massive from 'massive'
import getEnv from './config'
import { hash } from './hasher'
import { schema } from './schema'
import { Page, ValidationError } from './types'

let database: massive.Database
let env: massive.ConnectionInfo

export const closeDb = async () => {
  // Not testable for now
  /* istanbul ignore next */
  await database.withConnection(conn => {
    conn.pgp.end()
  })
}

export const validateInput = (input: Page): void | ValidationError => {
  const result = schema.validate(input, { abortEarly: false })

  if (result.error) {
    const validation_errors = invalidRequestReducer(result.error.details)
    return validation_errors
  }
  return
}


export const verifyUser = async (kasl_key: string): Promise<boolean> => {
  env = await getEnv(['PGPORT', 'PGHOST', 'PGUSER', 'PGPASSWORD', 'PGDATABASE'])

  database = await massive(env)

  const recs = await database.users.findDoc({ kasl_key })

  return (
    recs.length === 1 &&
    hash(`${recs[0].email}${recs[0].logged_in_at}`) === kasl_key &&
    recs[0].id
  )
}

export const create = async (event: APIGatewayProxyEvent) => {
  if (!event.body) {
    throw {
      message: HttpStatus.E_400,
      status: 400,
    }
  }
  const { contents, title } = JSON.parse(event.body)

  const validation_errors = validateInput({ contents, title })
  if (validation_errors) {
    throw {
      errors: validation_errors.errors,
      message: HttpStatus.E_400,
      status: 400,
    }
  }

  const kasl_key = event.headers['kasl-key']

  const user_id = await verifyUser(kasl_key)

  if (!user_id) {
    await closeDb()
    throw {
      message: HttpStatus.E_403,
      status: 403,
    }
  }

  const [date, time] = new Date().toISOString().split('T')
  const created_at = `${date} ${time.substring(0, 8)}`

  const rec = {
    contents,
    title,
    user_id,
    created_at,
    updated_at: null,
  }

  const record = await database.saveDoc('pages', rec)

  await closeDb()

  return record
}

export const list = async (event: APIGatewayProxyEvent) => {
  const kasl_key = event.headers['kasl-key']

  if (kasl_key) {
    const user_id = await verifyUser(kasl_key)

    if (!user_id) {
      await closeDb()
      throw {
        message: HttpStatus.E_403,
        status: 403,
      }
    }
  } else {
    env = await getEnv([
      'PGPORT',
      'PGHOST',
      'PGUSER',
      'PGPASSWORD',
      'PGDATABASE',
    ])
    database = await massive(env)
  }

  const query = event.queryStringParameters
  const filters = {}
  const options = {}
  options['limit'] = 10
  options['order'] = [
    {
      field: 'created_at',
      direction: 'desc',
      nulls: 'last',
    },
  ]

  if (query) {
    if (query.contents) {
      filters['contents'] = query.contents
    }

    if (query.limit) {
      options['limit'] = query.limit
    }
  }

  const record = await database.pages.findDoc(filters, options)

  await closeDb()

  return record
}
export const retrieve = async (event: APIGatewayProxyEvent) => {
  env = await getEnv(['PGPORT', 'PGHOST', 'PGUSER', 'PGPASSWORD', 'PGDATABASE'])

  database = await massive(env)

  const record = await database.pages.findDoc(event.pathParameters)

  await closeDb()

  return record
}
