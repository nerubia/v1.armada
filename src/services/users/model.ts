import { HttpStatus } from '@g-six/kastle-router'
import { hash } from './hasher'
import { pick } from 'lodash'
import { Database } from 'massive'
import {
  ErrorMessages,
  InputParams,
  UpdateProfileParams,
  UserCriteria,
} from './types'
import { Schema } from '@hapi/joi'

export const validateInput = async (input: InputParams, schema: Schema) => {
  const result = schema.validate(input, { abortEarly: false })
  if (result.error) {
    const validation_errors = result.error.details.map((error) => ({
      field: error.path[0],
      message: error.message,
    }))

    return validation_errors
  }

  return
}

export const retrieve = async (user_criteria: UserCriteria, db: Database) => {
  const records = await db.users.findDoc(user_criteria)

  if (records.length != 1) {
    throw { message: HttpStatus.E_401, status: 401 }
  }

  const user = records[0]

  return user
}

export const update = async (
  user_criteria: UserCriteria,
  params: UpdateProfileParams,
  db: Database,
) => {
  const records = await db.users.findDoc(user_criteria)

  if (records.length != 1) {
    throw { message: HttpStatus.E_401, status: 401 }
  }

  // only update allowable fields
  params = pick(params, [
    'alternate_email',
    'birthdate',
    'gender',
    'middle_name',
    'phone',
  ])

  const user = await db.users.updateDoc(records[0].id, params)

  return user
}

export const updatePassword = async (
  user_criteria: UserCriteria,
  current_password: string,
  new_password: string,
  db: Database,
) => {
  const records = await db.users.findDoc(user_criteria)

  if (records.length != 1) {
    throw { message: HttpStatus.E_401, status: 401 }
  }

  const user = records[0]

  // validate current password
  if (hash(current_password) != user.password_hash) {
    throw { message: ErrorMessages.CURRENT_PASSWORD_INVALID, status: 400 }
  }

  const updated = await db.users.updateDoc(user.id, {
    password_hash: hash(new_password),
  })

  return {
    ...pick(updated, ['id', 'email']),
  }
}
