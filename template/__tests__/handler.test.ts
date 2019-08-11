import { create, list } from '../handler'
import { APIGatewayProxyEvent, Context } from 'aws-lambda'

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

describe('Tokens handler: list', () => {
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

describe('Tokens handler: create', () => {
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
