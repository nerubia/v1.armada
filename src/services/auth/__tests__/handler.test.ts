import { APIGatewayProxyEvent } from 'aws-lambda'
import { create, index, login } from '../handler'
import { spyUpdateDoc, spyFindToken, spyFindUsers } from './mocks'

process.env.APP_SECRET = 'test'
const email = 'test@email.me'

describe('Records handler: index', () => {
  it('should return results', async () => {
    const { body } = await index()
    const { version } = JSON.parse(body)
    expect(version).toEqual('0.0.1')
  })
})
jest.mock('axios')

describe('Records handler: create', () => {
  describe('with valid headers', () => {
    const headers = {
      'client-id': 'valid id',
      'client-secret': 'valid secret',
    }

    it('should create record', async () => {
      const body = { email: 'test2@email.me', password: 'test123' }

      const actual = await create(mockEvent(
        body,
        headers,
      ) as APIGatewayProxyEvent)
      expect(actual).toHaveProperty('statusCode', 200)
    })

    it('should return invalid request on empty payload', async () => {
      const body = {}

      const actual = await create(mockEvent(
        body,
        headers,
      ) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 400)
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
      const body = { email: 'test2@email.me', password: 'test123' }

      const actual = await create(mockEvent(body, {
        'client-id': 'invalid id',
        'client-secret': 'invalid secret',
      }) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 401)
    })

    it('should default to 500 status code', async () => {
      const body = { email: 'error@test.me', password: 'test123' }

      const actual = await create(mockEvent(
        body,
        headers,
      ) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 500)
    })
  })
})

describe('Records handler: login', () => {
  it('should log valid user in and update timestamp', async () => {
    const body = { email, password: 'test123' }

    const actual = await login(mockEvent(body) as APIGatewayProxyEvent)

    expect(actual).toHaveProperty('statusCode', 200)
  })

  it('should return invalid request on no payload', async () => {
    const body = {}

    const actual = await login(mockEvent(body) as APIGatewayProxyEvent)
    expect(actual).toHaveProperty('statusCode', 400)
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
    instance: {
      $pool: {
        end: spyEnd,
      },
    },
    listTables: jest.fn(() => ['users']),
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
