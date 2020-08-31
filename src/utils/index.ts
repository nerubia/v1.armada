import { APIGatewayProxyEvent } from 'aws-lambda'
import Jwt from 'jsonwebtoken'
import { omit } from 'lodash'
import { Database } from 'massive'
import {
  KastleResponseHeaders as headers,
  HttpStatus,
} from '@g-six/kastle-router'
import Joi from '@hapi/joi'
import { SES, AWSError } from 'aws-sdk'

import { ErrorMessages } from './ts/enums'
import {
  DecodedToken,
  ErrorCatch,
  Response,
  PaginationResponse,
  PaginationFilter,
  QueryFilterOption,
  UserRecord,
  ValidationError,
} from './ts/interfaces'
import {
  SendTemplatedEmailRequest,
  SendTemplatedEmailResponse,
  SendEmailRequest,
} from 'aws-sdk/clients/ses'

/**
 * DO NOT FORGET TO ADD THESE ENV VARIABLES
 */
const ses = new SES({
  // istanbul ignore next
  region: process.env.AWS_DEFAULT_REGION || 'ap-southeast-1',
  apiVersion: '2010-12-01',
})

export const errorResponse = (e: ErrorCatch): Response => {
  const { status, message, stack, errors } = e
  const error = (message || stack || HttpStatus.E_500) as string
  return {
    body: JSON.stringify(
      {
        error,
        errors,
      },
      null,
      2,
    ),
    headers,
    statusCode: status || 500,
  }
}

export const filterExactQueries = <T>(
  query: T,
  options: QueryFilterOption = {},
) => {
  const filter = {}
  Object.entries(query)
    .filter((entry) => {
      if (!options.include_empty && typeof entry[1] === 'string' && !entry[1]) {
        return false
      }

      return entry[1] !== undefined
    })
    .map((entry) => ({
      property: entry[0],
      value: entry[1],
    }))
    .forEach(({ property, value }) => {
      filter[property] = value
    })

  return filter as T
}

export const filterLikeQueries = <T>(
  query: T,
  options: QueryFilterOption = {},
) => {
  const filter = {}
  Object.entries(query)
    .filter((entry) => {
      if (!options.include_empty && typeof entry[1] === 'string' && !entry[1]) {
        return false
      }

      return entry[1] !== undefined
    })
    .map((entry) => ({
      property: entry[0],
      value: entry[1],
    }))
    .forEach(({ property, value }) => {
      let modified_value = value
      if (options && options.wildcard && options.wildcard.includes('start')) {
        modified_value = `%${modified_value}`
      }
      if (options && options.wildcard && options.wildcard.includes('end')) {
        modified_value = `${modified_value}%`
      }
      filter[`${property} ILIKE`] = modified_value
    })

  return filter as T
}

export function paginationFilters(options: PaginationFilter) {
  const { field, limit: pagination_limit, order } = options
  const limit = pagination_limit || 10
  const offset = calculateOffset(options)

  return {
    order: [
      {
        field: field || 'created_at',
        direction: order || 'desc',
      },
    ],
    limit,
    offset,
  }
}

export function calculateOffset(options: PaginationFilter) {
  const { page, limit, offset } = options
  const newLimit = limit || 10
  const newOffset = offset || 0
  const newPage = page || 1

  return newPage > 1 ? Math.ceil(newPage * newLimit - newLimit) : newOffset
}

export function calculatePageNumber(options: PaginationFilter) {
  const { page, limit, offset } = options
  const newLimit = limit || 10
  const newOffset = offset || 0
  const newPage = page || 1

  if (newOffset > 0 && newPage <= 1) {
    return Math.floor((newOffset + newLimit) / newLimit)
  } else if (newPage > 1) {
    return newPage
  } else {
    return 1
  }
}

export function convertGmtStringToLocalDate(gmt_date: string | Date) {
  return new Date(`${gmt_date} GMT`)
}

export const getAppSecret = () => {
  // istanbul ignore next
  return process.env.APP_SECRET || ''
}

export const getRefreshTokenExpiry = () => {
  return !isNaN(Number(process.env.REFRESH_TOKEN_EXPIRY))
    ? Number(process.env.REFRESH_TOKEN_EXPIRY)
    : 30
}

export const getTimeStamptz = (curr_date: Date) => {
  const [date, ttz] = curr_date.toISOString().split('T')
  const time = ttz.substr(0, 8)
  return [date, time].join(' ')
}

export const successResponse = <T>(data: T, code: number): Response => {
  return {
    body: JSON.stringify(
      {
        data,
      },
      null,
      2,
    ),
    statusCode: code,
    headers,
  }
}

export const responsePaginationSuccess = <T>(
  data: PaginationResponse<T>,
  code: number,
): Response => {
  return {
    body: JSON.stringify(
      {
        data,
      },
      null,
      2,
    ),
    statusCode: code,
    headers,
  }
}

export async function validateInput<T, U>(
  input: T,
  schema: U,
  options: Joi.ValidationOptions = { abortEarly: false },
) {
  const joiValidation = Joi.object(schema)
  const result = joiValidation.validate(input, options)
  const validation_errors: ValidationError[] = []
  if (result.error) {
    result.error.details.map((error) =>
      validation_errors.push({
        field: error.path.join('.'),
        message: error.message,
        type: error.type,
      }),
    )
  }

  return validation_errors
}

export async function validateToken(
  event: APIGatewayProxyEvent,
  db: Database,
): Promise<UserRecord> {
  const authorization =
    event.headers['Authorization'] || event.headers['authorization'] || ''

  const token = authorization.includes('bearer ')
    ? authorization.replace('bearer ', '')
    : ''

  if (!token) {
    throw { message: ErrorMessages.UNAUTHORIZED_ACCESS, status: 401 }
  }

  let decoded: DecodedToken | undefined

  try {
    decoded = Jwt.verify(token, getAppSecret(), {
      algorithms: ['HS256'],
    }) as DecodedToken
  } catch (e) {
    decoded = undefined
  }

  if (!decoded) {
    throw { message: ErrorMessages.UNAUTHORIZED_ACCESS, status: 401 }
  }

  const { id: user_id, object_id } = decoded

  const records = await db.tokens.findDoc({
    object_id,
    user_id,
    'expiry >': getTimeStamptz(new Date()),
  })

  if (records.length != 1) {
    throw { message: ErrorMessages.UNAUTHORIZED_ACCESS, status: 401 }
  }

  const users = await db.users.findDoc({
    id: user_id,
  })

  const last_activity = getTimeStamptz(new Date())

  await db.users.updateDoc(
    {
      id: user_id,
    },
    {
      last_activity,
    },
  )

  return omit(users[0], ['password_hash']) as UserRecord
}

// istanbul ignore next
const handleSesError = (err: AWSError, data: SendTemplatedEmailResponse) => {
  if (err) {
    // TODO: Improve error handling here
    console.log({ err })
  }

  console.log({ data })
}

/**
 * Sends email using a template. Email templates are located in src/email-templates. Those templates must be saved to
 * AWS SES Email Templates using AWS CLI CreateTemplate API.
 *
 * aws ses create-template --cli-input-json file://email_template.json
 *
 * See https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SES.html#sendTemplatedEmail-property
 *
 * @param params Parameters of the email to be sent of type SendTemplatedEmailRequest
 */
// istanbul ignore next
export const sendTemplatedEmail = async (params: SendTemplatedEmailRequest) => {
  ses.sendTemplatedEmail(params, handleSesError)
}

/**
 * Sends email without a template
 *
 * See https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SES.html#sendEmail-property
 *
 * @param params Parameters of the email to sent of type SendEmailRequest
 */
// istanbul ignore next
export const sendEmail = async (params: SendEmailRequest) => {
  ses.sendEmail(params, handleSesError)
}
