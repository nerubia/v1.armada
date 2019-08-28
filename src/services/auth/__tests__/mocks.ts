const email = 'test@email.me'

export const spyFindToken = jest.fn(({ client_id, client_secret }) => {
  return client_id === 'valid id' && client_secret === 'valid secret'
})

export const spyFindUsers = jest.fn(creds => {
  if (creds.email === 'error@test.me') throw Error('Test error')

  return creds.email === email ? [{ id: 1, email }] : []
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
