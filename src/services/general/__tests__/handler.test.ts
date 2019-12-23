import { index } from '../handler'

process.env.APP_SECRET = 'testing'

describe('Records handler: index', () => {
  it('should return results', async () => {
    const { body } = await index()
    const { version } = JSON.parse(body)
    expect(version).toEqual('0.0.1')
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
