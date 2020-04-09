import { Database } from 'massive'
import { activate, create, forgotPassword, login, reRegister, verifyClient } from '../model'
import { email, test_at, spyUpdateDoc, spyFindToken, spyFindUsers } from './mocks'
import { hash } from '../hasher'
import { ErrorMessages } from '../types'
import { HttpStatus } from '@g-six/kastle-router'

jest.mock('axios')
jest.mock('@g-six/swiss-knife')

process.env.APP_SECRET = 'testing'
process.env.PORT = '5432'

let record = {}

const spyEnd = jest.fn()

const mock_db = ({
  listTables: jest.fn(() => ['users']),
  withConnection: spyEnd,
  saveDoc: jest.fn((undefined, doc) => {
    record = doc
    return record
  }),
  tokens: {
    findDoc: spyFindToken,
  },
  users: {
    findDoc: spyFindUsers,
    updateDoc: spyUpdateDoc,
  },
} as unknown) as Database

jest.mock('massive', () => jest.fn(() => mock_db))

const happy_user = {
  email: 'test',
  first_name: 'tester',
  last_name: 'validator',
  confirm_password: 'asdA$D123',
  password: 'asdA$D123',
}

const existing_user = {
  ...happy_user,
  email: 'test@email.me'
}

describe('create', () => {
  it(`should be able to create record`, async () => {
    const actual = await create(
      happy_user,
      mock_db,
    )
    expect(actual).toHaveProperty('email', 'test')
    const [date, ttz] = new Date().toISOString().split('T')
    const time = ttz.substr(0, 8)
    expect(actual.registered_at.substr(12)).toEqual([date, time].join(' ').substr(12))
  })
  it(`should throw 400 on existing record`, async () => {
    let error
    try {
      await create(
        existing_user,
        mock_db,
      )
    } catch (e) {
      error = e
    }
    expect(error).toHaveProperty('message', ErrorMessages.EMAIL_TAKEN)
  })
})

describe('login', () => {
  it(`should login on valid credentials`, async () => {
    const actual = await login(email, 'asd', mock_db)
    expect(actual['kasl-key'].length).toEqual(44)
    expect(actual).toHaveProperty('logged_in_at')
  })

  it(`should return error 403 on invalid credentials`, async () => {
    try {
      await login('testing@aaa.co', 'asd', mock_db)
    } catch (e) {
      expect(e.message).toEqual('error.invalid_credentials')
      expect(e.status).toEqual(403)
    }
  })

  it(`should return error 403 on unverified email`, async () => {
    try {
      await login('unverified@test.me', 'asd', mock_db)
    } catch (e) {
      expect(e.message).toEqual(ErrorMessages.EMAIL_UNVERIFIED)
      expect(e.status).toEqual(403)
    }
  })
})

describe('activate', () => {
  it(`should activate on valid link/key`, async () => {
    const actual = await activate(1, hash(test_at), mock_db)
    expect(actual['kasl-key'].length).toEqual(44)
    expect(actual).toHaveProperty('logged_in_at')
  })

  it(`should return error 403 on invalid credentials`, async () => {
    try {
      await activate(0, hash('2018-08-18'), mock_db)
    } catch (e) {
      expect(e.status).toEqual(403)
    }
  })

  it(`should return error 403 on invalid key`, async () => {
    try {
      const actual = await activate(1, hash('2018-08-18 10:00:00'), mock_db)
      expect(actual).toHaveProperty('is_activated')
    } catch (e) {
      expect(e.status).toEqual(403)
    }
  })

  it(`should return error 403 on expired key`, async () => {
    try {
      const actual = await activate(2, hash('2018-08-18 10:00:00'), mock_db)
      expect(actual).toHaveProperty('is_activated', false)
    } catch (e) {
      expect(e.status).toEqual(403)
    }
  })
})

describe('forgot password', () => {
  it(`should be able to generate reset key for forgot password`, async () => {
    const actual = await forgotPassword(
      email,
      mock_db,
    )
    expect(actual).toHaveProperty('email', email)
    expect(actual).toHaveProperty('reset_requested_at')

    const [date, ttz] = new Date().toISOString().split('T')
    const time = ttz.substr(0, 8)
    expect(actual.reset_requested_at.substr(12)).toEqual([date, time].join(' ').substr(12))
  })

  it(`should throw 400 on non existing user email`, async () => {
    try {
      await forgotPassword(
        'xxx@test.me',
        mock_db,
      )
    } catch (e) {
      expect(e).toHaveProperty('status', 400)
      expect(e).toHaveProperty('message', 'error.user_not_found')
    }
  })
})

describe('verifyClient', () => {
  it('return token on success', async () => {
    const actual = await verifyClient('valid id', 'valid secret', mock_db)
    expect(actual).toEqual(true)
  })
})

describe('reRegister', () => {
  it('should return 403 if user was not found', async () => {
    try {
      await reRegister('non-existent@test.me', mock_db)
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toEqual(403)
      expect(e.message).toEqual(HttpStatus.E_403)
    }
  })

  it('should return 403 if user is already activated', async () => {
    try {
      await reRegister(email, mock_db)
      expect(true).toBe(false)
    } catch (e) {
      expect(e.status).toEqual(403)
      expect(e.message).toEqual(HttpStatus.E_403)
    }
  })

  it('should re-register an unverified user', async () => {
    const user = await reRegister('unverified@test.me', mock_db)

    expect(user.activation_link).toBeDefined()
    expect(user.activation_link.length).toBe(44)
  })
})
