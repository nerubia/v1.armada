import { HttpStatus } from '@g-six/kastle-router'
import { APIGatewayProxyEvent } from 'aws-lambda'
import massive from 'massive'
import getEnv from './config'
import { hash } from './hasher'

let database: massive.Database
let env: massive.ConnectionInfo

export const closeDb = async () => {
  // Not testable for now
  /* istanbul ignore next */
  await database.withConnection(conn => {
    conn.pgp.end()
  })
}

export const verifyUser = async (kasl_key: string): Promise<boolean> => {
  env = await getEnv(['PGPORT', 'PGHOST', 'PGUSER', 'PGPASSWORD', 'PGDATABASE'])

  database = await massive(env)

  const recs = await database.users.findDoc({ kasl_key })

  await closeDb()

  return (
    recs.length === 1 &&
    hash(`${recs[0].email}${recs[0].logged_in_at}`) === kasl_key
  )
}

export const create = async (event: APIGatewayProxyEvent) => {
  if (!event.body) {
    throw {
      message: HttpStatus.E_400,
      status: 400,
    }
  }

  const kasl_key = event.headers['kasl-key']

  const is_verified = await verifyUser(kasl_key)

  if (!is_verified) {
    await closeDb()
    throw {
      message: HttpStatus.E_403,
      status: 403,
    }
  }

  const { contents, title } = JSON.parse(event.body)

  const [date, time] = new Date().toISOString().split('T')
  const created_at = `${date} ${time.substring(0, 8)}`

  const rec = {
    contents,
    title,
    created_at,
    updated_at: null,
  }

  const record = await database.saveDoc('pages', rec)

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
