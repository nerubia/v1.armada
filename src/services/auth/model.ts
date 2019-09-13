import { APIGatewayProxyEvent } from 'aws-lambda'
import { pick } from 'lodash'
import massive, { AnyObject } from 'massive'
import getEnv from './config'
import { hash } from './hasher'
import { Results, HttpStatus } from './types'

let database: massive.Database
export const verifyClient = async (
  client_id: string,
  client_secret: string,
): Promise<boolean> => {
  const token = await database.tokens.findDoc({ client_id, client_secret })

  return !!token
}

export const closeDb = async () => {
  // Not testable for now
  /* istanbul ignore next */
  await database.withConnection(conn => {
    conn.pgp.end()
  })
}

export const create = async (event: APIGatewayProxyEvent) => {
  const {
    'client-id': client_id,
    'client-secret': client_secret,
  } = event.headers

  if (!client_id || !client_secret) throw { status: 403 }
  if (!event.body) throw { status: 400 }

  const { email, password } = JSON.parse(event.body)
  if (!email || !password) throw { status: 400 }

  const env: AnyObject = await getEnv([
    'PGPORT',
    'PGHOST',
    'PGUSER',
    'PGPASSWORD',
    'PGDATABASE',
  ])
  database = await massive(env)

  if (!(await verifyClient(client_id, client_secret))) {
    await closeDb()
    throw { status: 403 }
  }

  const rec = {
    email,
    password_hash: hash(password),
  }

  const record = await database.saveDoc('users', rec)

  await closeDb()

  return record
}

export const login = async (event: APIGatewayProxyEvent) => {
  if (!event.body)
    throw {
      message: HttpStatus.E_400,
      status: 400,
    }

  const { email, password } = JSON.parse(event.body)
  if (!email || !password)
    throw {
      message: HttpStatus.E_400,
      status: 400,
    }

  const env: AnyObject = await getEnv([
    'PGPORT',
    'PGHOST',
    'PGUSER',
    'PGPASSWORD',
    'PGDATABASE',
  ])

  database = await massive(env)

  const rec = {
    email,
    password_hash: hash(password),
  }

  const records = await database.users.findDoc(rec)

  if (records.length != 1) {
    await closeDb()
    throw { message: HttpStatus.E_403, status: 403 }
  }

  const logged_in_at = new Date().toISOString()
  const kasl_key = hash(`${records[0].email}${logged_in_at}`)

  const updated = await database.users.updateDoc(records[0].id, {
    logged_in_at,
    kasl_key,
  })

  await closeDb()

  const results = (pick(updated, ['id', 'email']) as unknown) as Results
  results['kasl-key'] = kasl_key

  return results
}
