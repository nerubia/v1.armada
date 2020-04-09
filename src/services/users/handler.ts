import {
  HttpStatus,
  KastleResponseHeaders as headers,
} from '@g-six/kastle-router'
import { Database as database } from '@g-six/swiss-knife'
import { APIGatewayProxyEvent } from 'aws-lambda'

import { retrieve, update, updatePassword, validateInput } from './model'
import { Response, User } from './types'
import { password_update_schema, profile_update_schema } from './schema'

const userResponse = (user: User) => ({
  id: user.id,
  email: user.email,
  first_name: user.first_name,
  last_name: user.last_name,
  middle_name: user.middle_name || '',
  alternate_email: user.alternate_email || '',
  gender: user.gender || '',
  birthdate: user.birthdate || '',
  phone: user.phone || '',
  created_at: user.created_at,
  updated_at: user.updated_at,
})

const errorResponse = (code: number, error: string, errors?: {}): Response => ({
  body: JSON.stringify(
    {
      error,
      errors,
    },
    null,
    2,
  ),
  headers,
  statusCode: code || 500,
})

export const retrieveProfile = async (event: APIGatewayProxyEvent) => {
  let response: Response = {
    body: '',
    headers,
    statusCode: 500,
  }

  if (!event.headers['kasl-key']) {
    return errorResponse(401, HttpStatus.E_401)
  }

  const kasl_key = event.headers['kasl-key']

  const db = await database.getDatabase()

  try {
    const data = await retrieve({ kasl_key }, db)

    response.statusCode = 200

    response.body = JSON.stringify(
      {
        data: userResponse(data),
      },
      null,
      2,
    )
  } catch (e) {
    response = errorResponse(e.status, e.message)
  }

  await database.disconnectDb()

  return response
}

export const updateLogin = async (event: APIGatewayProxyEvent) => {
  let response: Response = {
    body: '',
    headers,
    statusCode: 500,
  }

  if (!event.headers['kasl-key']) {
    return errorResponse(401, HttpStatus.E_401)
  }

  if (!event.body || event.body === '{}') {
    return errorResponse(400, HttpStatus.E_400)
  }

  const kasl_key = event.headers['kasl-key']
  const payload = JSON.parse(event.body)

  const db = await database.getDatabase()

  const validationErrors = await validateInput(payload, password_update_schema)

  if (validationErrors) {
    return errorResponse(400, HttpStatus.E_400, validationErrors)
  }

  try {
    const data = await updatePassword(
      { kasl_key },
      payload.current_password,
      payload.password,
      db,
    )

    response.statusCode = 200

    response.body = JSON.stringify(
      {
        data,
      },
      null,
      2,
    )
  } catch (e) {
    response = errorResponse(e.status, e.message)
  }

  await database.disconnectDb()

  return response
}

export const updateProfile = async (event: APIGatewayProxyEvent) => {
  let response: Response = {
    body: '',
    headers,
    statusCode: 500,
  }

  if (!event.headers['kasl-key']) {
    return errorResponse(401, HttpStatus.E_401)
  }

  if (!event.body || event.body === '{}') {
    return errorResponse(400, HttpStatus.E_400)
  }

  const kasl_key = event.headers['kasl-key']
  const payload = JSON.parse(event.body)

  const db = await database.getDatabase()

  const validationErrors = await validateInput(payload, profile_update_schema)

  if (validationErrors) {
    return errorResponse(400, HttpStatus.E_400, validationErrors)
  }

  try {
    const data = await update({ kasl_key }, payload, db)

    response.statusCode = 200

    response.body = JSON.stringify(
      {
        data: userResponse(data),
      },
      null,
      2,
    )
  } catch (e) {
    response = errorResponse(e.status, e.message)
  }

  await database.disconnectDb()

  return response
}
