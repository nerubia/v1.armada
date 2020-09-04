import { HttpStatus } from '@g-six/kastle-router'
import { pick } from 'lodash'
import { Database } from 'massive'
import { hash } from './hasher'
import {
  ErrorMessages,
  InputParams,
  ResetPasswordParams,
  SignupParams,
  Results,
  User,
} from './types'
import { Schema } from 'joi'

export const verifyClient = async (
  client_id: string,
  client_secret: string,
  db: Database,
): Promise<boolean> => {
  const token = await db.tokens.findDoc({ client_id, client_secret })

  return !!token
}

export const validateInput = async (input: InputParams, schema: Schema) => {
  const result = schema.validate(input, { abortEarly: false })
  if (result.error) {
    const validation_errors: object[] = []
    result.error.details.map((error) =>
      validation_errors.push({
        field: error.path[0],
        message: error.message,
      }),
    )

    return validation_errors
  }

  return
}

export const create = async (record: SignupParams, db: Database) => {
  const [date, ttz] = new Date().toISOString().split('T')
  const time = ttz.substr(0, 8)
  const tables = await db.listTables()

  /* istanbul ignore else */
  if (tables.indexOf('users') >= 0) {
    const records = await db.users.findDoc(pick(record, ['email']))

    if (records.length >= 1) {
      throw { message: ErrorMessages.EMAIL_TAKEN, status: 400 }
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
  id: number,
  activation_key: string,
  db: Database,
) => {
  const user = await db.users.findDoc(id)

  if (user === null) {
    throw { message: HttpStatus.E_403, status: 403 }
  }

  const [date, ttz] = `${user.registered_at}`.split(' ')
  const time = ttz.substr(0, 8)
  const compare = hash([date, time].join(' '))

  if (compare != activation_key) {
    throw { message: ErrorMessages.KEY_INVALID, status: 403 }
  }

  const registered_at = new Date(user.registered_at)
  const logged_in_at = new Date().toISOString()
  const now = new Date()
  let is_activated = false

  if ((now.getTime() - registered_at.getTime()) / 60 / 60 / 1000 < 6) {
    is_activated = true
  } else {
    throw { message: ErrorMessages.KEY_EXPIRED, status: 403 }
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

export const forgotPassword = async (email: string, db: Database) => {
  const [date, ttz] = new Date().toISOString().split('T')
  const time = ttz.substr(0, 8)

  const reset_requested_at = [date, time].join(' ')

  const records = await db.users.findDoc({ email })
  if (records.length != 1) {
    return {
      id: null,
      email: null,
      first_name: null,
      last_name: null,
      created_at: null,
      reset_requested_at,
      reset_key: null,
    }
  }

  const user = await db.users.updateDoc(records[0].id, {
    reset_requested_at,
  })
  const reset_key = hash([date, time].join(' '))

  return {
    ...pick(user, [
      'id',
      'email',
      'first_name',
      'last_name',
      'created_at',
      'reset_requested_at',
    ]),
    reset_key,
  }
}

export const login = async (email: string, password: string, db: Database) => {
  const records = await db.users.findDoc({
    email,
    password_hash: hash(password),
  })

  // validate login credentials
  if (records.length != 1) {
    throw { message: ErrorMessages.INVALID_CREDENTIALS, status: 403 }
  }

  // validate email verified
  if (!records[0].is_activated) {
    throw { message: ErrorMessages.EMAIL_UNVERIFIED, status: 403 }
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

export const resetPassword = async (
  record: ResetPasswordParams,
  db: Database,
) => {
  const user = await db.users.findDoc(record.id)

  if (user === null) {
    throw { message: HttpStatus.E_403, status: 403 }
  }

  if (!user.reset_requested_at) {
    throw { message: ErrorMessages.KEY_INVALID, status: 403 }
  }

  const [date, ttz] = `${user.reset_requested_at}`.split(' ')
  const time = ttz.substr(0, 8)
  const compare = hash([date, time].join(' '))

  if (compare != record.reset_key) {
    throw { message: ErrorMessages.KEY_INVALID, status: 403 }
  }

  const reset_requested_at = new Date(user.reset_requested_at)
  const now = new Date()

  /* istanbul ignore else */
  if ((now.getTime() - reset_requested_at.getTime()) / 60 / 60 / 1000 >= 6) {
    throw { message: ErrorMessages.KEY_EXPIRED, status: 403 }
  }

  const updated = await db.users.updateDoc(user.id, {
    password_hash: hash(record.password),
    reset_requested_at: '',
    reset_key: '',
  })

  const results = (pick(updated, ['id', 'email']) as unknown) as Results

  return results
}

export const reRegister = async (email: string, db: Database) => {
  const records = await db.users.findDoc({ email })

  if (records.length != 1) {
    throw { message: HttpStatus.E_403, status: 403 }
  }

  const [user] = records

  if (user.is_activated) {
    throw { message: HttpStatus.E_403, status: 403 }
  }

  const [date, ttz] = new Date().toISOString().split('T')
  const time = ttz.substr(0, 8)
  const date_time = [date, time].join(' ')

  const activation_link = hash(date_time)

  const updated = await db.users.updateDoc(user.id, {
    registered_at: date_time,
  })

  return {
    ...pick(updated, ['id', 'email', 'first_name', 'last_name']),
    activation_link,
  }
}
