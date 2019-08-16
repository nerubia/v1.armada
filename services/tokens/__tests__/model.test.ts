import { create } from '../model'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { hash } from '../../../template/hasher'

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
    users: {
      findDoc: jest.fn(() => [
        {
          email,
          logged_in_at,
        },
      ]),
    },
    saveDoc: jest.fn((undefined, doc) => {
      record = doc
      return doc
    }),
  })),
)

describe('Create record', () => {
  it(`should be able to create record`, async () => {
    const actual = await create(({
      headers: { 'kasl-key': kasl_key },
    } as unknown) as APIGatewayProxyEvent)
    expect(actual).toEqual(record)
  })
})
