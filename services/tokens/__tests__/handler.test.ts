import { create, list } from '../handler'
import { APIGatewayProxyEvent, Context } from 'aws-lambda'

const kasl_key = 'asdasdasd'
const email = 'user@test.me'
const logged_in_at = new Date().toISOString()

describe('Tokens handler: list', () => {
  it('should return results', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const headers = { 'kasl-key': kasl_key }
    const actual = await list(
      mockEvent({}, headers) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 200)
  })
})

describe('Tokens handler: create', () => {
  it('should create record', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const headers = { 'kasl-key': kasl_key }
    const actual = await create(
      mockEvent({}, headers) as APIGatewayProxyEvent,
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

jest.mock('../hasher', () => ({
  hash: jest.fn(() => kasl_key),
  generateKey: jest.fn(() => 'some-random-client-id-for-testing'),
}))

const spyEnd = jest.fn()
jest.mock('massive', () =>
  jest.fn(() => ({
    withConnection: jest.fn(() => spyEnd),
    users: {
      findDoc: jest.fn(() => [
        {
          email,
          logged_in_at,
        },
      ]),
    },
    tokens: {
      findDoc: jest.fn(() => [{ id: 99999999999 }]),
    },
    saveDoc: jest.fn((undefined, doc) => doc),
  })),
)

const getBodyString = JSON.stringify
const mockEvent = (
  data: {} = {},
  headers: {} = {},
  httpMethod: string = 'GET',
) => ({
  body: getBodyString(data),
  headers,
  httpMethod,
  multiValueHeaders: {},
})
