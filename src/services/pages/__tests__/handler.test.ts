import { create, list, retrieve } from '../handler'
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
      mockEvent({
        title: 'A Test',
        contents: '# Testing',
      }) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 200)
  })
  it('should result in an error if no valid auth key', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await create(
      mockEvent(
        { title: 'A Test', contents: '# Testing' },
        { 'kasl-key': 'xxx' },
      ) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 403)
  })

  it('should default to error 500 on system error', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await create(
      mockEvent(
        { title: 'A Test', contents: '# Testing' },
        { 'kasl-key': 'error' },
      ) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 500)
  })
})

describe('Records handler: list', () => {
  it('should list records', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await list(
      mockEvent({}, {}) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 200)
  })

  it('should also provide user info if kasl_key passed in request', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await list(
      mockEvent({}) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    const body = JSON.parse(actual['body'])
    expect(body).toHaveProperty('data', { user: { id: 69 } })
  })

  it('should result in error if kasl-key passed was invalid', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await list(
      mockEvent({}, { 'kasl-key': 'xxx' }) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 403)
  })

  it('should default to error 500 on system error', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await list(
      mockEvent({}, { 'kasl-key': 'error' }) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 500)
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
      if (doc.contents === 'error') {
        throw 'Generic error'
      }
      return doc
    }),
    pages: {
      findDoc: jest.fn(filter => {
        if (filter.contents === 'error') {
          throw 'Generic error'
        }
        if (filter.id === 'error') {
          throw 'Generic error'
        }
        return [filter]
      }),
    },
    users: {
      findDoc: jest.fn(filter => {
        if (filter.kasl_key === 'error') {
          throw 'Generic error'
        }
        return [
          {
            id: 69,
            email,
            logged_in_at,
          },
        ]
      }),
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
  pathParameters: {},
  multiValueHeaders: {},
})
