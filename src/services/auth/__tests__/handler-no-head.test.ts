import { APIGatewayProxyEvent } from 'aws-lambda'
import { create, index } from '../handler'
import { spyUpdateDoc, spyFindToken, spyFindUsers } from './mocks'

process.env.APP_SECRET = 'test'

describe('Records handler: index', () => {
  it('should return results', async () => {
    const { body } = await index()
    const { version } = JSON.parse(body)
    expect(version).toEqual('0.0.4')
  })
})

jest.mock('mandrill-api')

describe('Records handler: create', () => {
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

    it('should default to 500 status code', async () => {
      const body = {
        email: 'error@test.me',
        first_name: 'error',
        last_name: 'self',
        password: 'test123',
        confirm_password: 'test123',
      }

      const actual = await create(mockEvent(
        body,
        headers,
      ) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 500)
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
