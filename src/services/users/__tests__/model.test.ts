import { HttpStatus } from '@g-six/kastle-router'
import { Database } from 'massive'
import { retrieve, update, updatePassword, validateInput } from '../model'
import { mock_user, spyFindUsers, spyUpdateDoc } from './mocks'
import { password_update_schema, profile_update_schema } from '../schema'
import { ErrorMessages } from '../types'

jest.mock('axios')

process.env.APP_SECRET = 'testing'
process.env.PORT = '5432'

const spyEnd = jest.fn()

const mock_db = ({
  listTables: jest.fn(() => ['users']),
  withConnection: spyEnd,
  users: {
    findDoc: spyFindUsers,
    updateDoc: spyUpdateDoc,
  },
} as unknown) as Database

jest.mock('massive', () => jest.fn(() => mock_db))

describe('retrieve', () => {
  it(`should retrieve logged in user information on valid credentials`, async () => {
    const actual = await retrieve({ kasl_key: mock_user.kasl_key }, mock_db)

    expect(actual).toHaveProperty('id')
    expect(actual).toHaveProperty('email')
    expect(actual).toHaveProperty('kasl_key', mock_user.kasl_key)
    expect(actual).toHaveProperty('middle_name', '')
  })

  it(`should throw 401 on invalid credentials`, async () => {
    try {
      await retrieve({ kasl_key: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' }, mock_db)
    } catch (e) {
      expect(e).toHaveProperty('status', 401)
      expect(e).toHaveProperty('message', HttpStatus.E_401)
    }
  })
})

describe('update', () => {
  const params = {
    middle_name: 'Tully'
  }

  it(`should update logged in user information on valid credentials`, async () => {
    const actual = await update({ kasl_key: mock_user.kasl_key }, params, mock_db)

    expect(actual).toHaveProperty('id')
    expect(actual).toHaveProperty('email')
    expect(actual).toHaveProperty('kasl_key', mock_user.kasl_key)
    expect(actual).toHaveProperty('middle_name', params.middle_name)
  })

  it(`should throw 401 on invalid credentials`, async () => {
    try {
      await update({ kasl_key: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' }, params, mock_db)
    } catch (e) {
      expect(e).toHaveProperty('status', 401)
      expect(e).toHaveProperty('message', HttpStatus.E_401)
    }
  })
})

describe('updatePassword', () => {
  it(`should update logged in user information on valid credentials`, async () => {
    const actual = await updatePassword({ kasl_key: mock_user.kasl_key }, 'password', 'new_password', mock_db)

    expect(actual).toHaveProperty('id')
    expect(actual).toHaveProperty('email')
  })

  it(`should throw 400 on invalid current password`, async () => {
    try {
      await updatePassword({ kasl_key: mock_user.kasl_key }, 'wrong_password', 'new_password', mock_db)
    } catch (e) {
      expect(e).toHaveProperty('status', 400)
      expect(e).toHaveProperty('message', ErrorMessages.CURRENT_PASSWORD_INVALID)
    }
  })

  it(`should throw 401 on invalid credentials`, async () => {
    try {
      await updatePassword({ kasl_key: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' }, 'wrong_password', 'new_password', mock_db)
    } catch (e) {
      expect(e).toHaveProperty('status', 401)
      expect(e).toHaveProperty('message', HttpStatus.E_401)
    }
  })
})

describe('validateInput', () => {
  describe('password_update_schema', () => {
    it(`should return undefined on valid payload`, async () => {
      const payload = {
        current_password: 'current_password',
        password: 'Password@123',
        confirm_password: 'Password@123',
      }
      const actual = await validateInput(payload, password_update_schema)
      expect(actual).toBeUndefined()
    })

    it(`should return field errors invalid payload`, async () => {
      const payload = {
        current_password: 'current_password',
        password: 'Password@123',
        confirm_password: 'Password@12345',
      }
      const actual = await validateInput(payload, password_update_schema)
      expect(actual).toHaveLength(1)

      const error = actual?.[0]
      expect(error).toHaveProperty('field', 'confirm_password')
      expect(error).toHaveProperty('message', ErrorMessages.CONFIRM_PASSWORD_INVALID)
    })
  })

  describe('profile_update_schema', () => {
    it(`should return undefined on valid payload`, async () => {
      const payload = {
        birthdate: '1980-02-29'
      }
      const actual = await validateInput(payload, profile_update_schema)
      expect(actual).toBeUndefined()
    })

    it(`should return field errors invalid payload`, async () => {
      const payload = {
        birthdate: '1980-02-30'
      }
      const actual = await validateInput(payload, profile_update_schema)
      expect(actual).toHaveLength(1)

      const error = actual?.[0]
      expect(error).toHaveProperty('field', 'birthdate')
      expect(error).toHaveProperty('message', ErrorMessages.BIRTHDATE_INVALID)
    })
  })
})
