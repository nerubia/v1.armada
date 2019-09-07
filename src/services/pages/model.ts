import { HttpStatus } from '@g-six/kastle-router'
import { generateUri, invalidRequestReducer } from '@g-six/swiss-knife'
import { APIGatewayProxyEvent } from 'aws-lambda'
import pick from 'lodash/pick'
import massive from 'massive'
import getEnv from './config'
import { hash } from './hasher'
import { schema } from './schema'
import { Page, ValidationError } from './types'

export const closeDb = async (db: massive.Database) => {
  // Not testable for now
  /* istanbul ignore next */
  await db.withConnection(conn => {
    conn.pgp.end()
  })
}

export const connectDb = async () => {
  const db_options = await getEnv([
    'PGPORT',
    'PGHOST',
    'PGUSER',
    'PGPASSWORD',
    'PGDATABASE',
  ])
  const db = await massive(db_options)

  return db
}

export const validateInput = (input: Page): void | ValidationError => {
  const result = schema.validate(input, { abortEarly: false })

  if (result.error) {
    const validation_errors = invalidRequestReducer(result.error.details)
    return validation_errors
  }
  return
}

interface UserInterface {
  id: number
  lang?: string
}

type UserVerificationResult = UserInterface | undefined

export const verifyUser = async (
  kasl_key: string,
  db: massive.Database,
): Promise<UserVerificationResult> => {
  const recs = await db.users.findDoc({ kasl_key })

  if (
    recs.length != 1 ||
    hash(`${recs[0].email}${recs[0].logged_in_at}`) != kasl_key
  ) {
    return
  } else {
    return pick(recs[0], ['email', 'id', 'lang', 'logged_in_at'])
  }
}

export const create = async (
  event: APIGatewayProxyEvent,
  user_id: number,
  db: massive.Database,
) => {
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

  const [date, time] = new Date().toISOString().split('T')
  const created_at = `${date} ${time.substring(0, 8)}`
  const slug = date + '-' + generateUri(title)

  const rec = {
    contents,
    slug,
    title,
    user_id,
    created_at,
    updated_at: null,
  }

  const record = await db.saveDoc('pages', rec)

  return record
}

export const list = async (
  event: APIGatewayProxyEvent,
  db: massive.Database,
) => {
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

  const records = await db.pages.findDoc(filters, options)
  return records
}

export const retrieve = async (
  event: APIGatewayProxyEvent,
  db: massive.Database,
) => {
  const record = await db.pages.findDoc(event.pathParameters)

  return record
}
