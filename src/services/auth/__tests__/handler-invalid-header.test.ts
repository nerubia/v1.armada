import { APIGatewayProxyEvent } from 'aws-lambda'
import { create, index } from '../handler'
import { spyUpdateDoc, spyFindToken, spyFindUsers } from './mocks'

process.env.APP_SECRET = 'test'
const email = 'test@email.me'
describe('Records handler: index', () => {
  it('should return results', async () => {
    const { body } = await index()
    const { version } = JSON.parse(body)
    expect(version).toEqual('0.0.4')
  })
})

const happy_user = {
  email: 'test2@email.me',
  first_name: 'tes',
  last_name: 't123',
  password: 'test123',
  confirm_password: 'test123',
}

describe('Records handler: create', () => {
  describe('with no valid headers', () => {
    const headers = {
      'client-id': 'invalid',
      'client-secret': 'invalid',
    }

    it('should not be able to create record', async () => {
      const body = happy_user

      const actual = await create(mockEvent(
        body,
        headers,
      ) as APIGatewayProxyEvent)
      expect(actual).toHaveProperty('statusCode', 401)
    })

    it('should return invalid request if required password was not provided', async () => {
      const body = { email }

      const actual = await create(mockEvent(
        body,
        headers,
      ) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 400)
    })

    it('should return unauthorized if client-id or secret was wrong', async () => {
      const body = happy_user

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
