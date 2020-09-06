import { findDocSpy } from '../__mocks__/database'
import { mockEvent } from '../__mocks__'

import Jwt from 'jsonwebtoken'
import Joi from 'joi'
import { Database as database } from '@g-six/swiss-knife'

import {
  errorResponse,
  calculateOffset,
  calculatePageNumber,
  filterExactQueries,
  filterLikeQueries,
  getAppSecret,
  getRefreshTokenExpiry,
  paginationFilters,
  responsePaginationSuccess,
  successResponse,
  validateInput,
  validateToken,
  generateSafeQuery,
} from '../index'

import { ErrorMessages } from '../ts/enums'

process.env.APP_SECRET = 'secret'

let db: any
describe('Utility functions for Proofn authentication', () => {
  beforeAll(() => {
    db = database.getDatabase()
  })
  describe('Utility that formats an error response', () => {
    it('should return an error with message', async () => {
      const errors = errorResponse({
        status: 0,
        message: 'Error',
        stack: '',
        errors: [],
      })
      expect(errors).toBeDefined()
    })

    it('should return an error with stack', async () => {
      const errors = errorResponse({
        status: 400,
        message: '',
        stack: 'stack error',
        errors: [],
      })
      expect(errors).toBeDefined()
    })

    it('should return an error with default E_500 response', async () => {
      const errors = errorResponse({
        status: 0,
        message: '',
        stack: '',
        errors: [],
      })
      expect(errors).toBeDefined()
    })
  })

  describe('Utility that formats a successful response', () => {
    it('should return successful response format', async () => {
      const data = {
        success: true,
      }
      const response = successResponse(data, 200)
      expect(response).toBeDefined()
    })
  })

  describe('Utility that formats a successful pagination response', () => {
    it('should return successful pagination response format', async () => {
      const data = {
        records: [],
        offset: 0,
        limit: 1000,
        total: 100,
      }
      const response = responsePaginationSuccess(data, 200)
      expect(response).toBeDefined()
    })
  })

  describe('Utility that filters out queries for searchable fields: with wildcards', () => {
    it('should return a exact query and ignore empty values', () => {
      const name = undefined
      const display = ''
      const query = filterLikeQueries({
        name,
        display,
      })

      expect(query).toEqual({})
    })

    it('should return a simple query with ILIKE identifier', () => {
      const name = 'the value of the name field'
      const display = 'the value of the display field'
      const empty = ''
      const query = filterLikeQueries(
        {
          name,
          display,
          empty,
        },
        { include_empty: true },
      )

      expect(query).toEqual({
        'name ILIKE': name,
        'display ILIKE': display,
        'empty ILIKE': empty,
      })
    })

    it('should return a simple query with ILIKE identifier and wildcard', () => {
      const name = 'the value of the name field'
      const display = 'the value of the display field'
      const empty = ''
      const query = filterLikeQueries(
        {
          name,
          display,
          empty,
        },
        { wildcard: ['start', 'end'] },
      )

      expect(query).toEqual({
        'name ILIKE': `%${name}%`,
        'display ILIKE': `%${display}%`,
      })
    })
  })

  describe('Utility that provides pagination filter properties', () => {
    it('should return default filter when there is no passed properties', () => {
      const expected = {
        order: [
          {
            field: 'created_at',
            direction: 'desc',
          },
        ],
        limit: 10,
        offset: 0,
      }
      const result = paginationFilters({})
      expect(result).toEqual(expected)
    })

    it('should return custom filter when there are passed properties', () => {
      const expected = {
        order: [
          {
            field: 'id',
            direction: 'asc',
          },
        ],
        limit: 1000,
        offset: 500,
      }
      const result = paginationFilters({
        field: 'id',
        order: 'asc',
        limit: 1000,
        offset: 500,
      })
      expect(result).toEqual(expected)
    })

    it('should return custom filter when there are passed properties', () => {
      const expected = {
        order: [
          {
            field: 'id',
            direction: 'asc',
          },
        ],
        limit: 1000,
        offset: 500,
      }
      const result = paginationFilters({
        field: 'id',
        order: 'asc',
        limit: 1000,
        offset: 500,
        page: 1,
      })
      expect(result).toEqual(expected)
    })

    it('should return default offset 0', () => {
      const result = calculateOffset({})
      expect(result).toEqual(0)
    })

    it('should return new calculated offset', () => {
      const result = calculateOffset({ limit: 1000, offset: 500, page: 2 })
      expect(result).not.toEqual(0)
    })

    it('should return default page 1', () => {
      const result = calculatePageNumber({})
      expect(result).toEqual(1)
    })

    it('should return custom page number based on passed offset', () => {
      const result = calculatePageNumber({ offset: 20 })
      expect(result).not.toEqual(1)
    })

    it('should return page number both offset and page are passed', () => {
      const result = calculatePageNumber({ offset: 20, page: 2 })
      expect(result).toEqual(2)
    })
  })

  describe('Utility that filters out exact queries for searchable fields', () => {
    it('should return a exact query and ignore empty values', () => {
      const name = undefined
      const display = ''
      const query = filterExactQueries({
        name,
        display,
      })

      expect(query).toEqual({})
    })

    it('should return a simple exact query', () => {
      const name = 'the value of the name field'
      const display = 'the value of the display field'
      const empty = ''
      const query = filterExactQueries(
        {
          name,
          display,
          empty,
        },
        { include_empty: true },
      )

      expect(query).toEqual({
        name,
        display,
        empty,
      })
    })
  })

  describe('Utility that gets then refresh token expiry from the env var', () => {
    it('should get the default expiry days if env is not set', () => {
      const expiry = getRefreshTokenExpiry()
      expect(expiry).toEqual(30)
    })

    it('should get refresh token expiry', () => {
      process.env.REFRESH_TOKEN_EXPIRY = '31'
      const expiry = getRefreshTokenExpiry()
      expect(expiry).toEqual(31)
    })
  })

  describe('Validates Input', () => {
    const schema = {
      username: Joi.string().required().messages({
        'any.required': 'required',
      }),
    }

    it('should return an errors since schema is wrong', async () => {
      const result = await validateInput({}, schema)
      expect(result).toEqual([
        {
          field: 'username',
          message: 'required',
          type: 'any.required',
        },
      ])
    })

    it('should return no errors since schema is satisfied', async () => {
      const result = await validateInput(
        {
          username: 'satisfiednow',
        },
        schema,
        { abortEarly: false },
      )
      expect(result).toEqual([])
    })
  })

  describe('Validates jwt token', () => {
    let token: string = ''
    beforeAll(async () => {
      token = await Jwt.sign(
        {
          id: 1,
          object_id: 'heymethis',
        },
        getAppSecret(),
        {
          algorithm: 'HS256',
          expiresIn: 3600,
        },
      )
    })

    it('should validate token successfully', async () => {
      findDocSpy.mockReturnValueOnce([
        {
          id: 1,
        },
      ])
      let error

      try {
        await validateToken(
          mockEvent(
            null,
            {
              authorization: `bearer ${token}`,
            },
            'GET',
          ),
          db,
        )
      } catch (e) {
        error = e.message
      }

      expect(error).toBeUndefined()
    })

    it('should fail since no token was passed', async () => {
      let error

      try {
        await validateToken(mockEvent(null, {}, 'GET'), db)
      } catch (e) {
        error = e.message
      }

      expect(error).toEqual(ErrorMessages.UNAUTHORIZED_ACCESS)
    })

    it('should fail since no bearer was passed', async () => {
      let error

      try {
        await validateToken(
          mockEvent(
            null,
            {
              Authorization: `${token}`,
            },
            'GET',
          ),
          db,
        )
      } catch (e) {
        error = e.message
      }

      expect(error).toEqual(ErrorMessages.UNAUTHORIZED_ACCESS)
    })

    it('should fail since it failed to decode the jwt token', async () => {
      process.env.APP_SECRET = 'wrong'
      let error

      try {
        await validateToken(
          mockEvent(
            null,
            {
              Authorization: `bearer ${token}`,
            },
            'GET',
          ),
          db,
        )
      } catch (e) {
        error = e.message
      }

      process.env.APP_SECRET = 'secret'

      expect(error).toEqual(ErrorMessages.UNAUTHORIZED_ACCESS)
    })

    it('should fail since it could not find the session record', async () => {
      findDocSpy.mockReturnValueOnce([])
      let error

      try {
        await validateToken(
          mockEvent(
            null,
            {
              Authorization: `bearer ${token}`,
            },
            'GET',
          ),
          db,
        )
      } catch (e) {
        error = e.message
      }

      expect(error).toEqual(ErrorMessages.UNAUTHORIZED_ACCESS)
    })
  })
})

describe('generateSafeQuery', () => {
  it('should convert Koa parsed query params to API GW parsing method', () => {
    const queryParams = {
      "field_1": "a",
      "field_2": ["1", "2", "3"],
    }

    const multivalueQueryParams = null

    const { queryStringParameters, multiValueQueryStringParameters } = generateSafeQuery(queryParams, multivalueQueryParams)

    expect(queryStringParameters).toMatchObject({
      "field_1": "a",
      "field_2": "3",
    })

    expect(multiValueQueryStringParameters).toMatchObject({
      "field_1": ["a"],
      "field_2": ["1", "2", "3"],
    })
  })

  it('should return the query params as is if parsed by API GW', () => {
    const queryParams = {
      "field_1": "a",
      "field_2": "3",
    }

    const multivalueQueryParams = {
      "field_1": ["a"],
      "field_2": ["1", "2", "3"],
    }

    const { queryStringParameters, multiValueQueryStringParameters } = generateSafeQuery(queryParams, multivalueQueryParams)

    expect(queryStringParameters).toMatchObject({
      "field_1": "a",
      "field_2": "3",
    })

    expect(multiValueQueryStringParameters).toMatchObject({
      "field_1": ["a"],
      "field_2": ["1", "2", "3"],
    })
  })
})
