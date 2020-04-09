import { APIGatewayProxyEvent } from 'aws-lambda'
import { create } from '../handler'
import { spyUpdateDoc, spyFindToken, spyFindUsers } from './mocks'

process.env.APP_SECRET = 'test'

describe('Records handler: create', () => {
  describe('with no valid headers', () => {
    it('should return unauthorized if client-id or secret was wrong', async () => {
      process.env.CLIENT_ID = 'client id'
      process.env.CLIENT_SECRET = 'client secret'
      const body = {
        some_data: '',
      }

      const actual = await create(mockEvent(body, {
        'client-id': 'invalid id',
        'client-secret': 'invalid secret',
      }) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 401)
    })
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
    instance: {
      $pool: {
        end: spyEnd,
      },
    },
    listTables: jest.fn(() => ['users']),
    saveDoc: jest.fn((undefined, doc) => {
      return doc
    }),
    users: {
      findDoc: spyFindUsers,
      updateDoc: spyUpdateDoc,
    },
    tokens: {
      findDoc: spyFindToken,
    },
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
