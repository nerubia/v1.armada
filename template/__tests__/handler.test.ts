import { list } from '../handler'
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

describe('Auth', () => {
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
