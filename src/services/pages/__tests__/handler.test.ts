import { create, list, retrieve, update, record } from '../handler'
import { APIGatewayProxyEvent, Context } from 'aws-lambda'
import { hash } from '../hasher'
import { PageCategory } from '../types'

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
        category: PageCategory.CASE_STUDIES,
        contents: '# Testing',
      }) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 200)
  })

  it('should result in an error if auth key not present', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await create(
      mockEvent(
        { title: 'A Test', contents: '# Testing' },
        {},
      ) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 403)
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

  it('should result in an error if no data in request', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await create(
      mockEvent(undefined, { 'kasl-key': 'xxx' }) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 400)
  })

  it('should result in an error if no data in request', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await create(
      mockEvent(
        { title: 'A Test', contents: '# Testing' },
        { 'kasl-key': 'more errors' },
      ) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 400)
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
    const user = {
      id: 69,
      email,
      logged_in_at,
    }
    expect(body).toHaveProperty('data', { user })
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

  it('should set statusCode if error contains status value', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await list(
      mockEvent({}, { 'kasl-key': 'more errors' }) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 400)
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

describe('Single record handler', () => {
  it('should retrieve record', async () => {
    const actual = await record(
      mockEvent(
        {},
        {},
        { identifier: 'case-studies/some-test' },
      ) as APIGatewayProxyEvent,
      {} as Context,
      () => {},
    )
    expect(actual).toHaveProperty('statusCode', 200)
  })

  it('should update record', async () => {
    const actual = await record(
      mockEvent(
        {},
        undefined,
        { identifier: 'some-test' },
        'PUT',
      ) as APIGatewayProxyEvent,
      {} as Context,
      () => {},
    )
    expect(actual).toHaveProperty('statusCode', 200)
  })
})

const pathParameters = { identifier: 'category/slug' }
describe('Records handler: retrieve', () => {
  it('should retrieve record', async () => {
    const actual = await retrieve(mockEvent(
      {},
      {},
      pathParameters,
    ) as APIGatewayProxyEvent)
    expect(actual).toHaveProperty('statusCode', 200)
  })
  it('should return empty body if no record was found', async () => {
    const actual = await retrieve(mockEvent(
      {},
      {},
      { identifier: 'not-found' },
    ) as APIGatewayProxyEvent)
    expect(actual).toHaveProperty('body', '')
  })

  it('should return error if no parameters passed', async () => {
    const actual = await retrieve(mockEvent({}, {}) as APIGatewayProxyEvent)
    expect(actual).toHaveProperty('statusCode', 400)
  })

  it('should retrieve record with auth user if kasl-key is valid', async () => {
    const actual = await retrieve(mockEvent(
      {},
      undefined,
      pathParameters,
    ) as APIGatewayProxyEvent)
    expect(actual).toHaveProperty('statusCode', 200)
  })

  it('should respond with forbidden if kasl-key is invalid', async () => {
    const actual = await retrieve(mockEvent(
      {},
      { 'kasl-key': 'xxx' },
      pathParameters,
    ) as APIGatewayProxyEvent)
    expect(actual).toHaveProperty('statusCode', 403)
  })
})

describe('Records handler: update', () => {
  it('should update record', async () => {
    const actual = await update(mockEvent(
      {
        title: 'A Test',
        contents: '# Testing',
      },
      undefined,
      pathParameters,
      'POST',
    ) as APIGatewayProxyEvent)
    expect(actual).toHaveProperty('statusCode', 200)
  })

  it('should result in an error if auth key not present', async () => {
    const actual = await update(mockEvent(
      { title: 'A Test', contents: '# Testing' },
      {},
      pathParameters,
    ) as APIGatewayProxyEvent)
    expect(actual).toHaveProperty('statusCode', 403)
  })

  it('should result in an error if no valid auth key', async () => {
    const actual = await update(mockEvent(
      { title: 'A Test', contents: '# Testing' },
      { 'kasl-key': 'xxx' },
      pathParameters,
    ) as APIGatewayProxyEvent)
    expect(actual).toHaveProperty('statusCode', 403)
  })

  it('should result in an error if no data in request', async () => {
    const actual = await update(mockEvent(undefined, {
      'kasl-key': 'xxx',
    }) as APIGatewayProxyEvent)
    expect(actual).toHaveProperty('statusCode', 400)
  })

  it('should result in an error if title empty in request', async () => {
    const actual = await update(mockEvent(
      {
        title: '',
      },
      undefined,
      pathParameters,
    ) as APIGatewayProxyEvent)
    expect(actual).toHaveProperty('statusCode', 400)
  })

  it('should result in an error if no id passed', async () => {
    const actual = await update(mockEvent(
      { title: 'A Test', contents: '# Testing' },
      { 'kasl-key': 'more errors' },
    ) as APIGatewayProxyEvent)
    expect(actual).toHaveProperty('statusCode', 400)
  })

  it('should default to error 500 on system error', async () => {
    const actual = await update(mockEvent(
      { title: 'A Test', contents: 'error' },
      { 'kasl-key': 'error' },
      pathParameters,
    ) as APIGatewayProxyEvent)
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

        if (!filter.slug) {
          return []
        }
        return [filter]
      }),
      updateDoc: jest.fn(filter => {
        if (filter.contents === 'error') {
          throw 'Generic error'
        }
        if (filter.id === 'error') {
          throw 'Generic error'
        }

        if (!filter.slug) {
          return []
        }
        return [filter]
      }),
    },
    users: {
      findDoc: jest.fn(filter => {
        if (filter.kasl_key === 'error') {
          throw {
            message: 'Generic error',
          }
        }

        if (filter.kasl_key === 'more errors') {
          throw {
            errors: { title: 'any.required' },
            message: 'Generic error',
            status: 400,
          }
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
  data?: {},
  headers: {} = { 'kasl-key': kasl_key },
  pathParameters?: { [name: string]: string },
  httpMethod: string = 'GET',
) => ({
  body: getBodyString(data),
  headers,
  httpMethod,
  pathParameters,
  multiValueHeaders: {},
})
