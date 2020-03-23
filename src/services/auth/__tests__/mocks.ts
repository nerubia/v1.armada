export const email = 'test@email.me'

const [date, ttz] = new Date().toISOString().split('T')
const time = ttz.substr(0, 8)
export const test_at = [date, time].join(' ')

export const spyDisconnectDb = jest.fn()

export const spyFindToken = jest.fn(({ client_id, client_secret }) => {
  return client_id === 'valid id' && client_secret === 'valid secret'
})

export const spyFindUsers = jest.fn((creds) => {
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
