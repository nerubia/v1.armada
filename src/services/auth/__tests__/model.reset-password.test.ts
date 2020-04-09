import { Database } from 'massive'
import { resetPassword } from '../model'
import { spyFindUsers, spyUpdateDoc } from './mocks'
import { hash } from '../hasher'
import { ErrorMessages, ResetPasswordParams } from '../types'

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
  id: 1,
  first_name: 'tester',
  last_name: 'validator',
  confirm_password: 'asdA$D123',
  reset_requested_at,
  password: 'asdA$D123',
}

describe('resetPassword', () => {
  const {
    id,
    password,
    reset_requested_at,
  } = happy_user


  it(`should reset on valid link/key`, async () => {
    const params: ResetPasswordParams = {
      id,
      reset_key: hash(`${reset_requested_at}`),
      password,
      confirm_password: password,
    }
    await resetPassword(params, mock_db)
    expect(spyUpdateDoc).toHaveBeenCalledWith(1, {
      password_hash: hash(password),
      reset_key: "",
      reset_requested_at: "",
    })
  })

  it(`should return error on expired link/key`, async () => {
    let error
    const params: ResetPasswordParams = {
      id: 2,
      reset_key: hash('2018-08-18 10:00:00'),
      password,
      confirm_password: password,
    }

    try {
      await resetPassword(params, mock_db)
    } catch (e) {
      error = e
    }
    expect(error).toHaveProperty('message', ErrorMessages.KEY_EXPIRED)
  })

  it(`should return error on invalid link/key`, async () => {
    let error
    const params: ResetPasswordParams = {
      id: 3,
      reset_key: '',
      password,
      confirm_password: password,
    }

    try {
      await resetPassword(params, mock_db)
    } catch (e) {
      error = e
    }
    expect(error).toHaveProperty('message', ErrorMessages.KEY_INVALID)
  })

  it(`should return error on hack attempt`, async () => {
    let error
    const params: ResetPasswordParams = {
      id: 3,
      reset_key: hash('2018-08-18 10:00:00'),
      password,
      confirm_password: password,
    }

    try {
      await resetPassword(params, mock_db)
    } catch (e) {
      error = e
    }
    expect(error).toHaveProperty('message', ErrorMessages.KEY_INVALID)
  })

  it(`should return error 403 on invalid credentials`, async () => {
    const params: ResetPasswordParams = {
      id: 1,
      reset_key: 'bad-key',
      password,
      confirm_password: password,
    }

    try {
      await resetPassword(params, mock_db)
    } catch (e) {
      expect(e.status).toEqual(403)
    }
  })

  it(`should return error 403 on incorrect user id`, async () => {
    const params: ResetPasswordParams = {
      id: 100,
      reset_key: hash(`${reset_requested_at}`),
      password,
      confirm_password: password,
    }

    try {
      await resetPassword(params, mock_db)
    } catch (e) {
      expect(e.status).toEqual(403)
    }
  })
})
