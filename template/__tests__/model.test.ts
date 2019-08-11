import { create } from '../model'
// import { Database } from 'massive'

process.env.SECRET = 'testing'
process.env.PORT = '5432'

let record = {}
const spyEnd = jest.fn()
jest.mock('massive', () =>
  jest.fn(() => ({
    withConnection: jest.fn(() => spyEnd),
    saveDoc: jest.fn((undefined, doc) => {
      record = doc
      return doc
    }),
  })),
)

describe('Create record', () => {
  it(`should be able to create record`, async () => {
    const actual = await create()
    expect(actual).toEqual(record)
  })
})
