import { HttpStatus } from '@g-six/kastle-router'
import { pick } from 'lodash'
import { Database } from 'massive'
import { hash } from './hasher'
import { Messages, Params, Results, User } from './types'

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
    console.log(records, pick(record, ['email']))
    if (records.length >= 1) {
      throw { message: Messages.EMAIL_TAKEN, status: 400 }
    }
  }

  const user: User = await db.saveDoc('users', {
    email: record.email,
    first_name: record.first_name,
    last_name: record.last_name,
    password_hash: hash(record.password),
    is_activated: false,
    registered_at: [date, time].join(' '),
    is_receiving_newsletter: record.is_receiving_newsletter,
  })
  const activation_link = hash([date, time].join(' '))

  return {
    ...pick(user, [
      'id',
      'email',
      'first_name',
      'last_name',
      'created_at',
      'registered_at',
    ]),
    activation_link,
  }
}

export const activate = async (
  email: string,
  activation_key: string,
  db: Database,
) => {
  const records = await db.users.findDoc({
    email,
  })

  if (records.length != 1) {
    throw { message: HttpStatus.E_403, status: 403 }
  }

  const [user] = records

  const [date, ttz] = `${user.registered_at}`.split(' ')
  const time = ttz.substr(0, 8)
  const compare = hash([date, time].join(' '))

  if (compare != activation_key) {
    throw { message: Messages.INVALID_KEY, status: 403 }
  }

  const registered_at = new Date(user.registered_at)
  const logged_in_at = new Date().toISOString()
  const now = new Date()
  let is_activated = false

  if ((now.getTime() - registered_at.getTime()) / 60 / 60 / 1000 < 6) {
    is_activated = true
  } else {
    throw { message: Messages.EXPIRED_KEY, status: 403 }
  }

  const kasl_key = hash(`${user.email}${logged_in_at}`)

  const updated = await db.users.updateDoc(user.id, {
    logged_in_at,
    is_activated,
    kasl_key,
  })

  const results = (pick(updated, [
    'id',
    'email',
    'is_activated',
    'logged_in_at',
  ]) as unknown) as Results

  results['kasl-key'] = kasl_key

  return results
}

export const login = async (email: string, password: string, db: Database) => {
  const records = await db.users.findDoc({
    email,
    password_hash: hash(password),
  })

  // validate login credentials
  if (records.length != 1) {
    throw { message: Messages.INVALID_CREDENTIALS, status: 403 }
  }

  // validate email verified
  if (!records[0].is_activated) {
    throw { message: Messages.UNVERIFIED_EMAIL, status: 403 }
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
