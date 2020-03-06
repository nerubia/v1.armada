import { sitrep } from '../handler'

process.env.APP_SECRET = 'testing'

describe('Records handler: sitrep', () => {
  it('should return results', async () => {
    const { body } = await sitrep()
    const { version } = JSON.parse(body)
    expect(version).toEqual('0.0.3')
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
