import { sitrep } from '../handler'
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

describe('General:sitrep', () => {
  it('should return results', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await sitrep(
      mockEvent() as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 200)
  })
})
