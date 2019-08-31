import { create, retrieve } from '../handler'
import { APIGatewayProxyEvent, Context } from 'aws-lambda'
import { hash } from '../hasher'

process.env.APP_SECRET = 'testing'

const email = 'user@test.me'
const logged_in_at = new Date().toISOString()
const kasl_key = hash(`${email}${logged_in_at}`)

describe('Records handler: create', () => {
  it('should create record', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await create(
      mockEvent() as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 200)
  })
})

describe('Records handler: retrieve', () => {
  it('should retrieve record', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await retrieve(
      mockEvent() as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 200)
  })
})

// Mocks at the bottom as we rarely modify them
jest.mock('aws-sdk/clients/ssm', () => {
  return jest.fn().mockImplementation(() => ({
    getParameters: jest.fn(() => ({
      promise: jest.fn(() => ({
        Parameters: [],
      })),
    })),
  }))
})

const spyEnd = jest.fn()
jest.mock('massive', () =>
  jest.fn(() => ({
    withConnection: jest.fn(() => spyEnd),
    saveDoc: jest.fn((undefined, doc) => {
      return doc
    }),
    users: {
      findDoc: jest.fn(() => [
        {
          email,
          logged_in_at,
        },
      ]),
    },
  })),
)

const getBodyString = JSON.stringify
const mockEvent = (
  data: {} = {},
  headers: {} = { 'kasl-key': kasl_key },
  httpMethod: string = 'GET',
) => ({
  body: getBodyString(data),
  headers,
  httpMethod,
  multiValueHeaders: {},
})
