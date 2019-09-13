import { APIGatewayProxyEvent } from 'aws-lambda'
import { create, list, login } from '../handler'
import { spyUpdateDoc, spyFindToken, spyFindUsers } from './mocks'

process.env.APP_SECRET = 'test'
const email = 'test@email.me'
describe('Records handler: list', () => {
  it('should return results', async () => {
    const actual = await list(mockEvent() as APIGatewayProxyEvent)
    expect(actual).toHaveProperty('statusCode', 200)
  })
})

describe('Records handler: create', () => {
  describe('with valid headers', () => {
    const headers = {
      'client-id': 'valid id',
      'client-secret': 'valid secret',
    }

    it('should create record', async () => {
      const body = { email: 'test@email.me', password: 'test123' }

      const actual = await create(mockEvent(
        body,
        headers,
      ) as APIGatewayProxyEvent)
      expect(actual).toHaveProperty('statusCode', 200)
    })

    it('should return invalid request if required password was not provided', async () => {
      const body = { email }

      const actual = await create(mockEvent(
        body,
        headers,
      ) as APIGatewayProxyEvent)
      expect(actual).toHaveProperty('statusCode', 400)
    })
  })
})

describe('Records handler: login', () => {
  it('should log valid user in and update timestamp', async () => {
    const body = { email, password: 'test123' }

    const actual = await login(mockEvent(body) as APIGatewayProxyEvent)

    expect(actual).toHaveProperty('statusCode', 200)
  })

  it('should return invalid request if required password was not provided', async () => {
    const body = { email }

    const actual = await login(mockEvent(body) as APIGatewayProxyEvent)
    expect(actual).toHaveProperty('statusCode', 400)
  })

  it('should default to 500 status code', async () => {
    const body = { email: 'error@test.me', password: 'test123' }

    const actual = await login(mockEvent(body) as APIGatewayProxyEvent)

    expect(actual).toHaveProperty('statusCode', 500)
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
