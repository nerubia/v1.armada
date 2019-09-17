import { parse } from 'querystring'
import { access } from '../model'

jest.mock('../config', () => {
  return jest.fn().mockImplementation(() => [])
})

jest.mock('axios')
const mockAxios = require('axios')

const code = 'asd123'
describe('model.access', () => {
  mockAxios.post = (url: string, payload: string) => {
    const data = parse(payload)
    if (data.code === code) {
      return {
        data,
      }
    }
    return {}
  }
  it(`should be able to authenticate`, async () => {
    const r = await access(code)
    expect(r).toHaveProperty('code', code)
  })

  it(`should be able to authenticate`, async () => {
    const r = await access('not valid')
    expect(r).toEqual(false)
  })
})
