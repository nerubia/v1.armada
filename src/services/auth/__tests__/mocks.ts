import { User } from '../types'

export const email = 'test@email.me'

const [date, ttz] = new Date().toISOString().split('T')
const time = ttz.substr(0, 8)
export const test_at = [date, time].join(' ')

export const spyDisconnectDb = jest.fn()

export const spyFindToken = jest.fn(({ client_id, client_secret }) => {
  return client_id === 'valid id' && client_secret === 'valid secret'
})

const findUsersByCriteria = (creds: User) => {
  if (creds.email === 'error@test.me') throw Error('Test error')

  if (creds.email === 'expired-key@test.me') {
    return [
      {
        id: 1,
        email: creds.email,
        registered_at: '2018-08-18 10:00:00',
        reset_requested_at: '2018-08-18 10:00:00',
      },
    ]
  }
  if (creds.email === 'unverified@test.me') {
    return [
      {
        id: 1,
        email,
        registered_at: test_at,
        is_activated: false,
      },
    ]
  }
  if (creds.email === 'non-existent@test.me') {
    return []
  }

  return creds.email === email
    ? [
        {
          id: 1,
          email,
          registered_at: test_at,
          reset_requested_at: test_at,
          is_activated: true,
        },
      ]
    : []
}

const findUsersById = (id: number) => {
  if (id === -1) throw Error('Test error')
  if (id === 0) return null
  if (id === 1) {
    return {
      id: 1,
      email,
      registered_at: test_at,
      is_activated: false,
      reset_requested_at: test_at,
    }
  }
  if (id === 2) {
    return {
      id: 2,
      email: 'expired-key@test.me',
      registered_at: '2018-08-18 10:00:00',
      reset_requested_at: '2018-08-18 10:00:00',
    }
  } else if (id === 3) {
    return {
      id: 2,
      email: 'expired-key@test.me',
      registered_at: '2018-08-18 10:00:00',
    }
  }

  return null
}

export const spyFindUsers = jest.fn((creds) => {
  const creds_type = typeof creds

  if (creds_type === 'object') {
    return findUsersByCriteria(creds)
  } else if (creds_type === 'number') {
    return findUsersById(creds)
  } else {
    throw 'Invalid parameters passed to findDoc'
  }
})

export const spyUpdateDoc = jest.fn((id, rec) => {
  return id === 1
    ? {
        ...rec,
        id,
        email,
      }
    : null
})
