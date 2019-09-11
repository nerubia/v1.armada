import { APIGatewayProxyEvent } from 'aws-lambda'
import { Database } from 'massive'
import { hash } from '../hasher'
import { create, list, retrieve, update } from '../model'
import { PageCategory } from '../types'

jest.mock('../config', () => {
  return jest.fn().mockImplementation(() => [])
})

process.env.APP_SECRET = 'testing'
process.env.PORT = '5432'

const email = 'user@test.me'
const logged_in_at = new Date().toISOString()
const kasl_key = hash(`${email}${logged_in_at}`)
const body = JSON.stringify({
  title: 'A test',
  contents: 'just a test',
  category: PageCategory.CASE_STUDIES,
  order: 0,
})

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
        ({
          body,
          headers: {},
        } as unknown) as APIGatewayProxyEvent,
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
        ({
          body: `{ "contents": "just a test" }`,
          headers: { 'kasl-key': kasl_key },
        } as unknown) as APIGatewayProxyEvent,
        user.id,
        db,
      )
    } catch (e) {
      expect(e).toHaveProperty('status', 400)
    }
  })
  it(`should be able to create record`, async () => {
    const actual = await create(
      ({
        body,
        headers: { 'kasl-key': kasl_key },
      } as unknown) as APIGatewayProxyEvent,
      user.id,
      db,
    )

    expect(actual).toEqual(record)
  })
})

describe('List records', () => {
  it(`should be able to list records`, async () => {
    const actual = await list(
      ({
        queryStringParameters: { contents: 'asd' },
        headers: {},
      } as unknown) as APIGatewayProxyEvent,
      db,
    )
    expect(actual).toEqual(record)
  })
  it(`should be able to list paginated records`, async () => {
    const actual = await list(
      ({
        queryStringParameters: { limit: 2 },
        headers: {},
      } as unknown) as APIGatewayProxyEvent,
      db,
    )
    expect(actual).toEqual(record)
  })
})

describe('Retrieve record', () => {
  it(`should throw 400 if parameters not set`, async () => {
    try {
      await create(({} as unknown) as APIGatewayProxyEvent, user.id, db)
    } catch (e) {
      expect(e).toHaveProperty('status', 400)
    }
  })
  it(`should be able to retrieve record`, async () => {
    const actual = await retrieve('slugger', PageCategory.CASE_STUDIES, db)
    expect(actual).toEqual(record)
  })
})

describe('Update record', () => {
  it(`should return error if schema requirements was unmet`, async () => {
    try {
      await update(1, '{"title": ""}', user.id, db)
    } catch (e) {
      expect(e).toHaveProperty('status', 400)
    }
  })

  it(`should be able to update record`, async () => {
    await update(1, body, user.id, db)
    expect(db.pages.updateDoc).toHaveBeenCalled()
  })

  it(`should be able to update record's title only`, async () => {
    await update(1, '{"title": "another test"}', user.id, db)

    expect(db.pages.updateDoc).toHaveBeenCalled()
  })

  it(`should be able to update record's contents only`, async () => {
    await update(1, '{"contents": "another test"}', user.id, db)

    expect(db.pages.updateDoc).toHaveBeenCalled()
  })

  it(`should be able to update record's category only`, async () => {
    await update(1, '{"category": "case-studies"}', user.id, db)

    expect(db.pages.updateDoc).toHaveBeenCalled()
  })
})
