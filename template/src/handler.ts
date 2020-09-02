import { Database as database } from '@g-six/swiss-knife'
import { APIGatewayProxyEvent } from 'aws-lambda'

import { errorResponse, successResponse, validateToken } from '../../src/utils'

import {
  create as createRecord,
  list as listRecords,
  retrieve as retrieveRecord,
  update as updateRecord,
} from './model'
import { validateBlogCreate } from './request'
import version from './version'

export const index = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `Life's a peach, eat more apples!`,
        version,
      },
      null,
      2,
    ),
  }
}

export const create = async (event: APIGatewayProxyEvent) => {
  try {
    const payload = JSON.parse(event.body || '{}')

    const db = await database.getDatabase()

    const validated_user = await validateToken(event, db)
    await validateBlogCreate(payload)

    const data = await createRecord(payload, validated_user.id, db)

    await database.disconnectDb()
    return successResponse(data, 200)
  } catch (e) {
    return errorResponse(e)
  }
}

export const list = async (event: APIGatewayProxyEvent) => {
  try {
    const payload = JSON.parse(event.body || '{}')

    const db = await database.getDatabase()

    await validateToken(event, db)

    const data = await listRecords(payload, db)

    await database.disconnectDb()
    return successResponse(data, 200)
  } catch (e) {
    return errorResponse(e)
  }
}

export const retrieve = async (event: APIGatewayProxyEvent) => {
  try {
    const id = Number(event.pathParameters?.id || 0)

    const db = await database.getDatabase()

    await validateToken(event, db)

    const data = await retrieveRecord(id, db)

    await database.disconnectDb()
    return successResponse(data, 200)
  } catch (e) {
    return errorResponse(e)
  }
}

export const update = async (event: APIGatewayProxyEvent) => {
  try {
    const id = Number(event.pathParameters?.id || 0)

    const payload = JSON.parse(event.body || '{}')

    const db = await database.getDatabase()

    const validated_user = await validateToken(event, db)

    await validateBlogCreate(payload)

    const data = await updateRecord(id, payload, validated_user.id, db)

    await database.disconnectDb()

    return successResponse(data, 200)
  } catch (e) {
    return errorResponse(e)
  }
}
