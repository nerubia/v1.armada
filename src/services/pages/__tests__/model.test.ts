import { APIGatewayProxyEvent } from 'aws-lambda'
import { hash } from '../hasher'
import { create, list, retrieve } from '../model'

jest.mock('../config', () => {
  return jest.fn().mockImplementation(() => [])
})

process.env.APP_SECRET = 'testing'
process.env.PORT = '5432'

const email = 'user@test.me'
const logged_in_at = new Date().toISOString()
const kasl_key = hash(`${email}${logged_in_at}`)

let record = {}

const spyEnd = jest.fn()
jest.mock('massive', () =>
  jest.fn(() => ({
    withConnection: jest.fn(() => spyEnd),
    saveDoc: jest.fn((undefined, doc) => {
      record = doc
      return doc
    }),
    pages: {
      findDoc: jest.fn(params => {
        record = params
        return record
      }),
    },
    users: {
      findDoc: jest.fn(() => [
        {
          email,
          logged_in_at,
        },
      ]),
    },
  })),
)

describe('Create record', () => {
  it(`should throw 403 if kasl-key not set`, async () => {
    try {
      await create(({
        body: `{ "contents": "just a test" }`,
        headers: {},
      } as unknown) as APIGatewayProxyEvent)
    } catch (e) {
      expect(e).toHaveProperty('status', 403)
    }
  })
  it(`should be able to create record`, async () => {
    const actual = await create(({
      body: `{ "contents": "just a test" }`,
      headers: { 'kasl-key': kasl_key },
    } as unknown) as APIGatewayProxyEvent)

    expect(actual).toEqual(record)
  })
})

describe('List records', () => {
  it(`should be able to list records`, async () => {
    const actual = await list(({
      queryStringParameters: { contents: 'asd' },
    } as unknown) as APIGatewayProxyEvent)
    expect(actual).toEqual(record)
  })
  it(`should be able to list paginated records`, async () => {
    const actual = await list(({
      queryStringParameters: { limit: 2 },
    } as unknown) as APIGatewayProxyEvent)
    expect(actual).toEqual(record)
  })
})

describe('Retrieve record', () => {
  it(`should throw 400 if parameters not set`, async () => {
    try {
      await create(({} as unknown) as APIGatewayProxyEvent)
    } catch (e) {
      expect(e).toHaveProperty('status', 400)
    }
  })
  it(`should be able to retrieve record`, async () => {
    const actual = await retrieve(({
      pathParameters: { page_id: 1 },
    } as unknown) as APIGatewayProxyEvent)
    expect(actual).toEqual(record)
  })
})
