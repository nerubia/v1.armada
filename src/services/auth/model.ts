import { HttpStatus } from '@g-six/kastle-router'
import { pick } from 'lodash'
import { Database } from 'massive'
import { hash } from './hasher'
import { Params, Results, User } from './types'

export const verifyClient = async (
  client_id: string,
  client_secret: string,
  db: Database,
): Promise<boolean> => {
  const token = await db.tokens.findDoc({ client_id, client_secret })

  return !!token
}

export const create = async (record: Params, db: Database) => {
  const [date, ttz] = new Date().toISOString().split('T')
  const time = ttz.substr(0, 8)
  const tables = await db.listTables()

  /* istanbul ignore else */
  if (tables.indexOf('users') >= 0) {
    const records = await db.users.findDoc(pick(record, ['email']))

    if (records.length >= 1) {
      throw { message: HttpStatus.E_400, status: 400 }
    }
  }

  const user: User = await db.saveDoc('users', {
    email: record.email,
    password_hash: hash(record.password),
    created_at: [date, time].join(' '),
  })

  return pick(user, ['id', 'email', 'created_at'])
}

export const login = async (email: string, password: string, db: Database) => {
  const records = await db.users.findDoc({
    email,
    password_hash: hash(password),
  })

  if (records.length != 1) {
    throw { message: HttpStatus.E_403, status: 403 }
  }
  const logged_in_at = new Date().toISOString()
  const kasl_key = hash(`${records[0].email}${logged_in_at}`)

  const updated = await db.users.updateDoc(records[0].id, {
    logged_in_at,
    kasl_key,
  })

  const results = (pick(updated, [
    'id',
    'email',
    'logged_in_at',
  ]) as unknown) as Results

  results['kasl-key'] = kasl_key

  return results
}
