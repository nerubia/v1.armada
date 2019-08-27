import { create, list } from '../handler'
import { APIGatewayProxyEvent, Context } from 'aws-lambda'

process.env.APP_SECRET = 'testing'
describe('Records handler: list', () => {
  it('should return results', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await list(
      mockEvent() as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 200)
  })
})

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
