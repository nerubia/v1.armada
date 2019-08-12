import massive from 'massive'
import getEnv from './config'
import { generateKey, hash } from './hasher'

export const create = async () => {
  const env = await getEnv([
    'PGPORT',
    'PGHOST',
    'PGUSER',
    'PGPASSWORD',
    'PGDATABASE',
  ])
  let record

  const database = await massive(env)
  const key: string = generateKey()

  const rec = {
    key,
    secret: hash(key),
    used_at: '',
  }

  record = await database.saveDoc('records', rec)

  // Not testable for now
  /* istanbul ignore next */
  await database.withConnection(conn => {
    conn.pgp.end()
  })

  return record
}
