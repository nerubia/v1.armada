import { Database } from 'massive'
import { resetPassword } from '../model'
import { email, spyFindUsers, spyUpdateDoc } from './mocks'
import { hash } from '../hasher'
import { Messages } from '../types'

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
  users: {
    findDoc: spyFindUsers,
    updateDoc: spyUpdateDoc,
  },
} as unknown) as Database

jest.mock('massive', () => jest.fn(() => mock_db))

const [date, ttz] = new Date().toISOString().split('T')
const time = ttz.substr(0, 8)
const reset_requested_at = [date, time].join(' ')
const happy_user = {
  email,
  first_name: 'tester',
  last_name: 'validator',
  confirm_password: 'test password 123',
  reset_requested_at,
  password: 'test password 123',
}

describe('resetPassword', () => {
  const {
    email,
    password,
    reset_requested_at,
  } = happy_user

  it(`should reset on valid link/key`, async () => {
    await resetPassword(email, hash(`${reset_requested_at}`), password, password, mock_db)
    expect(spyUpdateDoc).toHaveBeenCalledWith(1, {
      password_hash: hash(password),
    })
  })

  it(`should return error on password confirmation mismatch`, async () => {
    let error
    try {
      await resetPassword(email, hash(`${reset_requested_at}`), password, 'different', mock_db)
    } catch (e) {
      error = e
    }
    expect(error).toHaveProperty('message', Messages.INCORRECT_PASSWORD_CONFIRMATION)
  })

  it(`should return error on expired link/key`, async () => {
    let error
    try {
      await resetPassword('expired-key@test.me', hash('2018-08-18 10:00:00'), password, password, mock_db)
    } catch (e) {
      error = e
    }
    expect(error).toHaveProperty('message', Messages.EXPIRED_KEY)
  })

  it(`should return error on invalid link/key`, async () => {
    let error
    try {
      await resetPassword('expired-key@test.me', hash('2018-08-19 10:00:00'), password, password, mock_db)
    } catch (e) {
      error = e
    }
    expect(error).toHaveProperty('message', Messages.INVALID_KEY)
  })

  it(`should return error on hack attempt`, async () => {
    let error
    try {
      await resetPassword('unverified@test.me', hash('2018-08-19 10:00:00'), password, password, mock_db)
    } catch (e) {
      error = e
    }
    expect(error).toHaveProperty('message', Messages.INVALID_KEY)
  })

  it(`should return error 403 on invalid credentials`, async () => {
    try {
      await resetPassword('testing@aaa.co', 'bad-key', password, password, mock_db)
    } catch (e) {
      expect(e.status).toEqual(403)
    }
  })
})