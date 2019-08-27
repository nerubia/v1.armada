import massive from 'massive'
import getEnv from './config'
import { generateKey, hash } from './hasher'

let database: massive.Database

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

export const create = async () => {
  const env = await getEnv([
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

  const key: string = generateKey()

  const rec = {
    key,
    secret: hash(key),
    used_at: '',
  }

  const record = await database.saveDoc('records', rec)

  await closeDb()

  return record
}
