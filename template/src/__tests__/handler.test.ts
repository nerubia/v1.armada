import '../../../src/utils/__mocks__/token'
import { listSpy, retrieveSpy } from '../__mocks__/template-model'
import { mockEvent, unmockAll } from '../__mocks__/template'

import { index, create, list, retrieve, update } from '../handler'
import { ErrorMessages } from '../constants'

process.env.APP_SECRET = 'testing'
describe('Blog management', () => {
  describe('Creates a blog for the user', () => {
    it('should fail to create due to no fields passed', async () => {
      const { body } = await create(mockEvent(null))
      const { errors = [] } = JSON.parse(body)
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should succeed in creating a new blog', async () => {
      const payload = {
        title: 'Blog title',
        contents: 'Content of blog',
        parent_id: 1,
        slug: 'Slug',
      }

      const result = await create(mockEvent(payload))

      const response = JSON.parse(result.body)
      expect(response.data).toEqual({
        title: 'Blog title',
        contents: 'Content of blog',
        parent_id: 1,
        slug: 'Slug',
      })
    })
  })

  describe('List Contacts', () => {
    it('should fail to since token was not passed', async () => {
      listSpy.mockImplementationOnce(() => {
        throw {
          message: 'Error',
        }
      })
      const { body } = await list(mockEvent({}, {}, 'GET'))
      const { error } = JSON.parse(body)
      expect(error).toBeDefined()
    })

    it('should succeed retrieving contacts', async () => {
      const result = await list(mockEvent({}, {}, 'GET'))
      const response = JSON.parse(result.body)
      expect(response.data).toEqual([])
    })
  })

  describe('Retrieve a contact', () => {
    it('should return an error query is malformed', async () => {
      retrieveSpy.mockImplementationOnce(() => {
        throw {
          message: 'Error',
        }
      })
      const { body } = await retrieve(mockEvent({}, {}, 'GET'))
      const { error } = JSON.parse(body)
      expect(error).toBeDefined()
    })

    it('should succeed in retrieving a contact', async () => {
      const payload = {
        id: 1,
      }
      const result = await retrieve(
        mockEvent({}, {}, 'GET', {
          pathParameters: payload,
        }),
      )

      const response = JSON.parse(result.body)
      expect(response.data).toEqual(payload)
    })
  })

  describe('Update contacts', () => {
    it('should fail to create due to no fields passed', async () => {
      const { body } = await update(mockEvent(null))
      const { errors = [] } = JSON.parse(body)
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should succeed in updating a new blog', async () => {
      const payload = {
        title: 'Blog title',
        contents: 'Content of blog',
        parent_id: 1,
        slug: 'Slug',
      }

      const result = await update(
        mockEvent(payload, {}, 'GET', {
          pathParameters: payload,
        }),
      )

      const response = JSON.parse(result.body)
      expect(response.data).toEqual({
        title: 'Blog title',
        contents: 'Content of blog',
        parent_id: 1,
        slug: 'Slug',
      })
    })
  })

  afterAll(() => {
    unmockAll()
  })
})
