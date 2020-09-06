import { User } from '../types'
import { hash } from '../hasher'

process.env.APP_SECRET = 'testing'

export const mock_user = {
  id: 1,
  email: 'test@email.me',
  first_name: 'Arya',
  last_name: 'Stark',
  middle_name: '',
  kasl_key: 'k5JqmxsEUQ9WjVg0QM2hkGZEOh+o5khVSZRZFHTOhyI=',
  password_hash: hash('password'),
}

export const spyDisconnectDb = jest.fn()

const findUsersByCriteria = (user: User) => {
  if (user.kasl_key === 'xxx') throw Error('Test error')

  if (user.kasl_key === mock_user.kasl_key) {
    return [mock_user]
  }

  return []
}

export const spyFindUsers = jest.fn((creds) => {
  const creds_type = typeof creds

  if (creds_type === 'object') {
    return findUsersByCriteria(creds)
  }

  throw 'Invalid parameters passed to findDoc'
})

export const spyUpdateDoc = jest.fn((id, rec) => {
  return id === 1
    ? {
        ...mock_user,
        ...rec,
      }
    : null
})
