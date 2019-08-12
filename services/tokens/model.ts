import massive from 'massive'
import getEnv from './config'
import { generateKey, hash } from './hasher'
import { APIGatewayProxyEvent } from 'aws-lambda'

let database: massive.Database
let env: massive.ConnectionInfo
export const verifyUser = async (kasl_key: string): Promise<boolean> => {
  env = await getEnv(['PGPORT', 'PGHOST', 'PGUSER', 'PGPASSWORD', 'PGDATABASE'])

  database = await massive(env)

  const recs = await database.users.findDoc({ kasl_key })

  return (
    recs.length === 1 &&
    hash(`${recs[0].email}${recs[0].logged_in_at}`) === kasl_key
  )
}

export const closeDb = async () => {
  // Not testable for now
  /* istanbul ignore next */
  await database.withConnection(conn => {
    conn.pgp.end()
  })
}

export const list = async (event: APIGatewayProxyEvent) => {
  const kasl_key = event.headers['kasl-key']

  const is_verified = await verifyUser(kasl_key)

  if (!is_verified) {
    await closeDb()
    throw 403
  }

  const records = database.tokens.findDoc(
    {},
    {
      limit: 1,
    },
  )

  await closeDb()

  return records
}

export const create = async (event: APIGatewayProxyEvent) => {
  const kasl_key = event.headers['kasl-key']

  const is_verified = await verifyUser(kasl_key)

  if (!is_verified) {
    await closeDb()
    throw 403
  }

  let token

  const client_id: string = generateKey()

  const rec = {
    client_id,
    client_secret: hash(client_id),
    used_at: '',
  }

  token = await database.saveDoc('tokens', rec)

  await closeDb()

  return token
}
