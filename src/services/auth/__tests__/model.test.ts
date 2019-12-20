import { Database } from 'massive'
import { create, login, verifyClient } from '../model'
import { email, spyUpdateDoc, spyFindToken, spyFindUsers } from './mocks'

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

describe('create', () => {
  it(`should be able to create record`, async () => {
    const actual = await create(
      {
        email: 'test',
        password: 'asd',
      },
      mock_db,
    )
    expect(actual).toHaveProperty('email', 'test')
    const [date, ttz] = new Date().toISOString().split('T')
    const time = ttz.substr(0, 8)
    expect(actual).toHaveProperty('created_at', [date, time].join(' '))
  })
  it(`should throw 400 on existing record`, async () => {
    try {
      await create(
        {
          email: email,
          password: 'asd',
        },
        mock_db,
      )
    } catch (e) {
      expect(e).toHaveProperty('status', 400)
    }
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
      expect(e.status).toEqual(403)
    }
  })

  it(`should return error 403 on invalid credentials`, async () => {
    try {
      await login('testing@aaa.co', 'asd', mock_db)
    } catch (e) {
      expect(e.status).toEqual(403)
    }
  })
})

describe('verifyClient', () => {
  it('return token on success', async () => {
    const actual = await verifyClient('valid id', 'valid secret', mock_db)
    expect(actual).toEqual(true)
  })
})
