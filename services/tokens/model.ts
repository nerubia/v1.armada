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
  let token

  const database = await massive(env)
  const client_id: string = generateKey()

  const rec = {
    client_id,
    client_secret: hash(client_id),
    used_at: '',
  }

  token = await database.saveDoc('tokens', rec)

  // Not testable for now
  /* istanbul ignore next */
  await database.withConnection(conn => {
    conn.pgp.end()
  })

  return token
}
