import { parse } from 'querystring'
import { oauth } from '../handler'
import { APIGatewayProxyEvent, Context } from 'aws-lambda'

jest.mock('axios')
const mockAxios = require('axios')

describe('handler.oauth', () => {
  mockAxios.post = (url: string, payload: string) => {
    const data = parse(payload)
    if (data.code !== 'E') {
      return {
        data,
        url,
      }
    }
    throw Error
  }

  it('should auth', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await oauth(
      mockEvent({
        code: 'A Test',
      }) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 302)
  })

  it('should respond with 403 if no code provided', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await oauth(
      mockEvent({}) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 403)
  })

  it('should respond with 500 as default error', async () => {
    const spyCallback = jest.fn()
    const context: Context = {} as any
    const actual = await oauth(
      mockEvent({ code: 'E' }) as APIGatewayProxyEvent,
      context,
      spyCallback,
    )
    expect(actual).toHaveProperty('statusCode', 500)
  })
})

const mockEvent = (queryStringParameters: { [name: string]: string }) =>
  (({
    queryStringParameters,
  } as unknown) as APIGatewayProxyEvent)
