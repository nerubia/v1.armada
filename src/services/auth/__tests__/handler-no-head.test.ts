import { APIGatewayProxyEvent } from 'aws-lambda'
import { create } from '../handler'
import { spyUpdateDoc, spyFindToken, spyFindUsers } from './mocks'

process.env.APP_SECRET = 'test'

jest.mock('mandrill-api')

describe('Records handler: create', () => {
  describe('with no headers', () => {
    it('should return invalid request on empty secret', async () => {
      const headers = {}
      const body = {}

      const actual = await create(mockEvent(
        body,
        headers,
      ) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 400)
    })

    it('should return invalid request on empty secret', async () => {
      const headers = {
        'client-id': 'valid id',
      }
      const body = {}

      const actual = await create(mockEvent(
        body,
        headers,
      ) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 400)
    })

    it('should return invalid request on empty id', async () => {
      const headers = {
        'client-secret': 'valid secret',
      }
      const body = {}

      const actual = await create(mockEvent(
        body,
        headers,
      ) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 400)
    })
  })

  describe('with no valid headers', () => {
    const headers = {
      'client-id': '',
      'client-secret': '',
    }

    it('should return invalid request on empty payload', async () => {
      const body = {}

      const actual = await create(mockEvent(
        body,
        headers,
      ) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 400)
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
