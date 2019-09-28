import { Database } from 'massive'
import { create, list, retrieve, update } from '../model'

jest.mock('../config', () => {
  return jest.fn().mockImplementation(() => [])
})

process.env.APP_SECRET = 'testing'
process.env.PORT = '5432'

const email = 'user@test.me'
const logged_in_at = new Date().toISOString()
let record = {}

const spyEnd = jest.fn()
const db = ({
  withConnection: jest.fn(() => spyEnd),
  saveDoc: jest.fn((undefined, doc) => {
    record = doc
    return doc
  }),
  pages: {
    findDoc: jest.fn(params => {
      record = params
      return record
    }),
    updateDoc: jest.fn(params => params),
  },
  users: {
    findDoc: jest.fn(() => [
      {
        id: 1,
        email,
        logged_in_at,
      },
    ]),
  },
} as unknown) as Database

const user = { id: 69 }
describe('Create record', () => {
  it(`should throw 403 if kasl-key not set`, async () => {
    try {
      await create(
        {
          title: 'title',
          contents: 'contents',
        },
        user.id,
        db,
      )
    } catch (e) {
      expect(e).toHaveProperty('status', 403)
    }
  })
  it(`should return error if schema requirements was unmet`, async () => {
    try {
      await create(
        {
          title: 'title',
          contents: 'contents',
        },
        user.id,
        db,
      )
    } catch (e) {
      expect(e).toHaveProperty('status', 400)
    }
  })
  it(`should be able to create record`, async () => {
    const actual = await create(
      {
        title: 'title',
        contents: 'contents',
      },
      user.id,
      db,
    )

    expect(actual).toEqual(record)
  })
})

describe('List records', () => {
  it(`should be able to list records`, async () => {
    const actual = await list({ contents: 'asd' }, db)
    expect(actual).toEqual(record)
  })
  it(`should be able to list paginated records`, async () => {
    const actual = await list({ limit: 2 }, db)
    expect(actual).toEqual(record)
  })
})

describe('Retrieve record', () => {
  it(`should be able to retrieve record`, async () => {
    const actual = await retrieve(69, db)
    expect(actual).toEqual(record)
  })
})

describe('Update record', () => {
  it(`should return error if schema requirements was unmet`, async () => {
    try {
      await update(
        1,
        {
          title: '',
        },
        user.id,
        db,
      )
    } catch (e) {
      expect(e).toHaveProperty('status', 400)
    }
  })

  it(`should be able to update record`, async () => {
    await update(
      1,
      {
        title: 'title',
        contents: 'contents',
      },
      user.id,
      db,
    )
    expect(db.pages.updateDoc).toHaveBeenCalled()
  })

  it(`should be able to update record's title only`, async () => {
    await update(
      1,
      {
        title: 'title',
      },
      user.id,
      db,
    )

    expect(db.pages.updateDoc).toHaveBeenCalled()
  })

  it(`should be able to update record's contents only`, async () => {
    await update(
      1,
      {
        contents: 'contents',
      },
      user.id,
      db,
    )

    expect(db.pages.updateDoc).toHaveBeenCalled()
  })
})
