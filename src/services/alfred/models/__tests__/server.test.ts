import { list } from '../server'

jest.mock('../config', () => {
  return jest.fn().mockImplementation(() => [])
})

const code = 'asd123'
describe('models/server: list', () => {
  it(`should be able to authenticate`, async () => {
    const r = await list()
    expect(r).toHaveProperty('code', code)
  })
})
