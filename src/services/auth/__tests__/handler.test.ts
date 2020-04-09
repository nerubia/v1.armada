import { APIGatewayProxyEvent } from 'aws-lambda'
import { activate, create, forgot, index, login, resendActivation, resetPassword } from '../handler'
import { hash } from '../hasher'
import { email, test_at, spyUpdateDoc, spyFindToken, spyFindUsers } from './mocks'

process.env.APP_SECRET = 'test'

describe('Records handler: index', () => {
  it('should return results', async () => {
    const { body } = await index()
    const { version } = JSON.parse(body)
    expect(version).toEqual('0.0.6')
  })
})

jest.mock('mandrill-api')

const { Mandrill } = require('mandrill-api/mandrill')
const sendTemplate = (tpl: string, callback: () => {}, errorHandler: () => {}) => {
  return new Promise(callback)
}
Mandrill.mockImplementation(() => ({
  messages: {
    sendTemplate,
  },
}))

const happy_user = {
  email: 'test2@email.me',
  first_name: 'tes',
  last_name: 't123',
  password: 'te$T!ng1x2Y3',
  confirm_password: 'te$T!ng1x2Y3',
}

describe('Records handler: create', () => {
  process.env.CLIENT_ID = 'valid id'
  process.env.CLIENT_SECRET = 'valid secret'

  describe('with empty headers', () => {
    const headers = {}

    it('should create record', async () => {
      const body = happy_user

      const actual = await create(mockEvent(
        body,
        headers,
      ) as APIGatewayProxyEvent)
      expect(actual).toHaveProperty('statusCode', 200)
    })

    it('should not create record on weak password', async () => {
      const body = {
        ...happy_user,
        password: 'weakpass',
        confirm_password: 'weakpass',
      }

      const actual = await create(mockEvent(
        body,
        headers,
      ) as APIGatewayProxyEvent)

      expect(JSON.parse(actual.body).errors[0]).toHaveProperty('message', 'error.password.weak')
    })
  })

  describe('with valid headers', () => {
    const headers = {
      'client-id': 'valid id',
      'client-secret': 'valid secret',
    }

    it('should create record', async () => {
      const body = happy_user

      const actual = await create(mockEvent(
        body,
        headers,
      ) as APIGatewayProxyEvent)
      expect(actual).toHaveProperty('statusCode', 200)
    })

    it('should return invalid request on empty payload', async () => {
      const body = {}

      const actual = await create(mockEvent(
        body,
        headers,
      ) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 400)
    })

    it('should return invalid request if required email was not provided', async () => {
      const body = { password: 'asdasda' }

      const actual = await create(mockEvent(
        body,
        headers,
      ) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 400)
    })

    it('should return invalid request if required password was not provided', async () => {
      const body = { email }

      const actual = await create(mockEvent(
        body,
        headers,
      ) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 400)
    })

    it('should return unauthorized if client-id or secret was wrong', async () => {
      const body = happy_user

      const actual = await create(mockEvent(body, {
        'client-id': 'invalid id',
        'client-secret': 'invalid secret',
      }) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 401)
    })

    it('should handle error 500', async () => {
      const body = {
        ...happy_user,
        email: 'error@test.me'
      }

      const actual = await create(mockEvent(
        body,
        headers,
      ) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 500)
    })
  })
})

describe('Records handler: activate', () => {
  it('should activate valid user and update timestamp', async () => {
    const body = { id: 1, activation_key: hash(test_at) }

    const actual = await activate(mockEvent(body) as APIGatewayProxyEvent)

    expect(actual).toHaveProperty('statusCode', 200)
  })

  it('should return invalid request on no payload', async () => {
    const body = {}

    const actual = await activate(mockEvent(body) as APIGatewayProxyEvent)
    expect(actual).toHaveProperty('statusCode', 400)
  })

  it('should return invalid request if activation_key was not provided', async () => {
    const body = { id: 1 }

    const actual = await activate(mockEvent(body) as APIGatewayProxyEvent)
    expect(actual).toHaveProperty('statusCode', 400)
  })

  it('should return invalid request if activation_key invalid', async () => {
    const body = { id: 1, activation_key: hash('2018-08-19 10:00:00') }

    const actual = await activate(mockEvent(body) as APIGatewayProxyEvent)
    expect(actual).toHaveProperty('statusCode', 403)
  })

  it('should default to 500 status code', async () => {
    const body = { id: -1, activation_key: 'test123' }

    const actual = await activate(mockEvent(body) as APIGatewayProxyEvent)

    expect(actual).toHaveProperty('statusCode', 500)
  })
})

describe('Records handler: login', () => {
  it('should log valid user in and update timestamp', async () => {
    const body = { email, password: 'te$T!ng123' }

    const actual = await login(mockEvent(body) as APIGatewayProxyEvent)

    expect(actual).toHaveProperty('statusCode', 200)
  })

  it('should return invalid request on no payload', async () => {
    const body = {}

    const actual = await login(mockEvent(body) as APIGatewayProxyEvent)
    expect(actual).toHaveProperty('statusCode', 400)
  })

  it('should return invalid request if required email and password was not provided', async () => {
    const body = { first_name: 'john' }

    const actual = await login(mockEvent(body) as APIGatewayProxyEvent)
    expect(actual).toHaveProperty('statusCode', 400)
    expect(actual).toHaveProperty('body')

    const actual_body = JSON.parse(actual.body)
    expect(actual_body).toHaveProperty('error', 'error-client.bad-request')
    expect(actual_body).toHaveProperty('errors')
    expect(actual_body.errors).toHaveLength(2)
  })

  it('should default to 500 status code', async () => {
    const body = { email: 'error@test.me', password: 'te$T!ng123' }

    const actual = await login(mockEvent(body) as APIGatewayProxyEvent)

    expect(actual).toHaveProperty('statusCode', 500)
  })
})

describe('Records handler: resetPassword', () => {
  describe('with valid headers', () => {
    it('should reset password', async () => {
      const body = {
        id: 1,
        reset_key: hash(test_at),
        password: 'te$T!ng123',
        confirm_password: 'te$T!ng123'
      }

      const actual = await resetPassword(mockEvent(
        body,
      ) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 200)
    })


    it('should handle general error', async () => {
      const body = {
        id: -1,
        reset_key: 'asdasd',
        password: 'te$T!ng123',
        confirm_password: 'te$T!ng123',
      }

      const actual = await resetPassword(mockEvent(body) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 500)
    })

    it('should return invalid request on empty payload', async () => {
      const body = {}

      const actual = await resetPassword(mockEvent(
        body,
      ) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 400)
    })

    it('should return invalid request if required email was not provided', async () => {
      const body = { password: 'te$T!ng123' }

      const actual = await resetPassword(mockEvent(
        body,
      ) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 400)
    })

    it('should return invalid request if required password was not provided', async () => {
      const body = { id: 1 }

      const actual = await resetPassword(mockEvent(
        body,
      ) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 400)
    })
  })
})

describe('Records handler: forgot password', () => {
  it('should generate reset key', async () => {
    const body = { email }

    const actual = await forgot(mockEvent(body) as APIGatewayProxyEvent)
    expect(actual).toHaveProperty('statusCode', 200)
    expect(actual).toHaveProperty('body')

    const actual_body = JSON.parse(actual.body)
    expect(actual_body).toHaveProperty('message', 'success.forgot_password_confirmation')
    expect(actual_body).toHaveProperty('data')

    expect(actual_body.data).toHaveProperty('reset_requested_at')
  })

  it('should handle general error', async () => {
    const body = {
      email: 'error@test.me',
      reset_key: 'asdasd',
      password: 'te$T!ng123',
      confirm_password: 'te$T!ng123',
    }

    const actual = await forgot(mockEvent(
      body,
    ) as APIGatewayProxyEvent)

    expect(actual).toHaveProperty('statusCode', 500)
  })

  it('should return invalid request on empty payload', async () => {
    const body = {}

    const actual = await forgot(mockEvent(body) as APIGatewayProxyEvent)

    expect(actual).toHaveProperty('statusCode', 400)
    expect(actual).toHaveProperty('body')

    const actual_body = JSON.parse(actual.body)
    expect(actual_body).toHaveProperty('error', 'error-client.bad-request')
  })

  it('should return invalid request if required email was not provided with field specific errors', async () => {
    const body = { first_name: 'asdasda' }

    const actual = await forgot(mockEvent(body) as APIGatewayProxyEvent)

    expect(actual).toHaveProperty('statusCode', 400)
    expect(actual).toHaveProperty('body')

    const actual_body = JSON.parse(actual.body)
    expect(actual_body).toHaveProperty('error', 'error-client.bad-request')
    expect(actual_body).toHaveProperty('errors')
    expect(actual_body.errors).toHaveLength(1)
  })
})

describe('Records handler: resendVerification', () => {
  it('should return invalid request on no payload', async () => {
    const body = {}

    const actual = await resendActivation(mockEvent(body) as APIGatewayProxyEvent)
    expect(actual).toHaveProperty('statusCode', 400)
  })

  it('should return invalid request if email was not provided', async () => {
    const body = { some_other_field: 'john' }

    const actual = await resendActivation(mockEvent(body) as APIGatewayProxyEvent)
    expect(actual).toHaveProperty('statusCode', 400)
    expect(actual).toHaveProperty('body')

    const actual_body = JSON.parse(actual.body)
    expect(actual_body).toHaveProperty('error', 'error-client.bad-request')
    expect(actual_body).toHaveProperty('errors')
    expect(actual_body.errors).toHaveLength(1)
  })

  it('should re-register user', async () => {
    const body = { email: 'unverified@test.me' }

    const actual = await resendActivation(mockEvent(body) as APIGatewayProxyEvent)
    expect(actual).toHaveProperty('statusCode', 200)
    expect(actual).toHaveProperty('body')
  })

  it('should be able to handle errors', async () => {
    const body = { email }

    const actual = await resendActivation(mockEvent(body) as APIGatewayProxyEvent)

    expect(actual).toHaveProperty('body')

    const actual_body = JSON.parse(actual.body)
    expect(actual_body).toHaveProperty('error')
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
    instance: {
      $pool: {
        end: spyEnd,
      },
    },
    listTables: jest.fn(() => ['users']),
    withConnection: jest.fn(() => spyEnd),
    saveDoc: jest.fn((undefined, doc) => {
      return doc
    }),
    users: {
      findDoc: spyFindUsers,
      updateDoc: spyUpdateDoc,
    },
    tokens: {
      findDoc: spyFindToken,
    },
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
