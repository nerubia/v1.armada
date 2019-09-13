import { APIGatewayProxyEvent } from 'aws-lambda'
import { create, login } from '../model'
import { spyUpdateDoc, spyFindToken, spyFindUsers } from './mocks'

jest.mock('../config', () => {
  return jest.fn().mockImplementation(() => [])
})

process.env.APP_SECRET = 'testing'
process.env.PORT = '5432'

const email = 'test@email.me'
let record = {}

const spyEnd = jest.fn()

jest.mock('massive', () =>
  jest.fn(() => ({
    withConnection: jest.fn(() => spyEnd),
    saveDoc: jest.fn((undefined, doc) => {
      record = doc
      return doc
    }),
    tokens: {
      findDoc: spyFindToken,
    },
    users: {
      findDoc: spyFindUsers,
      updateDoc: spyUpdateDoc,
    },
  })),
)

describe('Create record', () => {
  it(`should be able to create record`, async () => {
    const headers = {
      'client-id': 'valid id',
      'client-secret': 'valid secret',
    }
    const event: APIGatewayProxyEvent = ({
      headers,
      body: JSON.stringify({
        email: 'test',
        password: 'asd',
      }),
    } as unknown) as APIGatewayProxyEvent
    const actual = await create(event)
    expect(actual).toEqual(record)
    expect(spyFindToken).toHaveBeenCalledTimes(1)
  })
  it(`should throw error 403 on missing headers`, async () => {
    const headers = {}
    const event: APIGatewayProxyEvent = ({
      headers,
      body: JSON.stringify({
        email: 'test',
        password: 'asd',
      }),
    } as unknown) as APIGatewayProxyEvent

    try {
      await create(event)
    } catch (e) {
      expect(e).toHaveProperty('status', 403)
    }
  })
  it(`should throw error 403 on invalid headers`, async () => {
    const headers = {
      'client-id': 'asd',
      'client-secret': 'qwe',
    }
    const event: APIGatewayProxyEvent = ({
      headers,
      body: JSON.stringify({
        email: 'test',
        password: 'asd',
      }),
    } as unknown) as APIGatewayProxyEvent

    try {
      await create(event)
    } catch (e) {
      expect(e).toHaveProperty('status', 403)
    }
  })

  it(`should throw error 400 on empty body`, async () => {
    const headers = {
      'client-id': 'valid id',
      'client-secret': 'valid secret',
    }
    const event: APIGatewayProxyEvent = ({
      headers,
      body: '',
    } as unknown) as APIGatewayProxyEvent

    try {
      await create(event)
    } catch (e) {
      expect(e).toHaveProperty('status', 400)
    }
  })

  it(`should throw error 400 on missing fields`, async () => {
    const headers = {
      'client-id': 'valid id',
      'client-secret': 'valid secret',
    }
    const event: APIGatewayProxyEvent = ({
      headers,
      body: JSON.stringify({
        email: 'test',
      }),
    } as unknown) as APIGatewayProxyEvent

    try {
      await create(event)
    } catch (e) {
      expect(e).toHaveProperty('status', 400)
    }
  })
})

describe('login', () => {
  it(`should login on valid credentials`, async () => {
    const event: APIGatewayProxyEvent = ({
      body: JSON.stringify({
        email,
        password: 'asd',
      }),
    } as unknown) as APIGatewayProxyEvent
    const actual = await login(event)
    expect(actual['kasl-key'].length).toEqual(44)
  })

  it(`should return error 403 on invalid credentials`, async () => {
    const event: APIGatewayProxyEvent = ({
      body: JSON.stringify({
        email: 'testing@aaa.co',
        password: 'asd',
      }),
    } as unknown) as APIGatewayProxyEvent

    try {
      await login(event)
    } catch (e) {
      expect(e.status).toEqual(403)
    }
  })

  it(`should return error 400 on missing fields`, async () => {
    const event: APIGatewayProxyEvent = ({
      body: JSON.stringify({
        password: 'asd',
      }),
    } as unknown) as APIGatewayProxyEvent

    try {
      await login(event)
    } catch (e) {
      expect(e.status).toEqual(400)
    }
  })

  it(`should return error 400 on invalid request body`, async () => {
    const event: APIGatewayProxyEvent = ({
      body: '',
    } as unknown) as APIGatewayProxyEvent

    try {
      await login(event)
    } catch (e) {
      expect(e.status).toEqual(400)
    }
  })
})
