import massive from 'massive'
import { generateKey, hash } from './hasher'

export const create = async () => {
  let token
  const database = await massive(process.env)
  const client_id: string = generateKey()

  const rec = {
    client_id,
    client_secret: hash(client_id),
    used_at: '',
  }

  token = await database.saveDoc('tokens', rec)

  await database.withConnection(conn => {
    // Not testable for now
    /* istanbul ignore next */
    conn.pgp.end()
  })

  return token
}
