import {
  countDocSpy,
  findDocSpy,
  listTablesSpy,
  updateDocSpy,
} from '../../../src/utils/__mocks__/database'
import { unmockAll } from '../__mocks__/template'
import { Database as database } from '@g-six/swiss-knife'

import { create, list, retrieve, update } from '../model'
import { ErrorMessages } from '../constants'
import { omit } from 'lodash'

process.env.APP_SECRET = 'testing'
describe('Model for blog creation', () => {
  beforeEach(() => {
    countDocSpy.mockClear()
    findDocSpy.mockClear()
    listTablesSpy.mockReturnValue(['tokens', 'users'])
  })

  describe('Creates a new blog', () => {
    it('should handle creating a new blog', async () => {
      listTablesSpy.mockReturnValueOnce(['contacts'])
      findDocSpy.mockReturnValueOnce([])

      const db = await database.getDatabase()

      const payload: any = {
        title: 'Blog title',
        contents: 'Content of blog',
        parent_id: 1,
        slug: 'Slug',
      }

      const result = await create(payload, 1, db)
      expect(result).toEqual(payload)
    })
  })

  describe('List blogs', () => {
    it('should list blogs', async () => {
      const records = [
        {
          id: 1,
          email: 'test@proofn.com',
        },
      ]
      const expected = {
        limit: 10,
        offset: 0,
        records,
        page: 1,
        total: NaN,
      }
      findDocSpy.mockReturnValueOnce(records)
      const db = await database.getDatabase()
      const recent = await list({}, db)
      expect(recent).toEqual(expected)
    })
  })

  describe('Retrieve Blog', () => {
    it('should throw an error if blog does not exist', async () => {
      findDocSpy.mockReturnValueOnce([])
      let error
      try {
        const db = await database.getDatabase()
        await retrieve(10, db)
      } catch (e) {
        error = e.message
      }

      expect(error).toEqual(ErrorMessages.BLOG_DOES_NOT_EXIST)
    })

    it('should retrieve a blog record', async () => {
      const record = {
        body: {
          id: 1,
          title: 'Blog title',
          contents: 'Content of blog',
          parent_id: 1,
          slug: 'Slug',
        },
      }
      const expected = {
        id: 1,
        title: 'Blog title',
        contents: 'Content of blog',
        parent_id: 1,
        slug: 'Slug',
      }
      findDocSpy.mockReturnValueOnce([record])
      const db = await database.getDatabase()
      const result = await retrieve(1, db)
      expect(result).toEqual(expected)
    })
  })

  describe('Update blog', () => {
    it('should throw an error if blog does not exist', async () => {
      updateDocSpy.mockReturnValueOnce([])
      let error
      try {
        const db = await database.getDatabase()
        await update(1, {}, 1, db)
      } catch (e) {
        error = e.message
      }

      expect(error).toEqual(ErrorMessages.BLOG_DOES_NOT_EXIST)
    })
    it('should update blog', async () => {
      const record: any = {
        id: 1,
        title: 'Blog title',
        contents: 'Content of blog',
        parent_id: 1,
        slug: 'Slug',
      }

      updateDocSpy.mockReturnValue([record])
      const db = await database.getDatabase()
      const result = await update(1, omit(record, ['id']), 1, db)
      expect(result).toEqual(record)
    })
  })

  afterAll(() => {
    unmockAll()
  })
})
