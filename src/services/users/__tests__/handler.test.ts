import { HttpStatus } from '@g-six/kastle-router'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { retrieveProfile, updateLogin, updateProfile } from '../handler'
import { ErrorMessages } from '../types'
import { mock_user, spyFindUsers, spyUpdateDoc } from './mocks'

process.env.APP_SECRET = 'testing'

describe('Logged in user', () => {
  describe('Profile Retrieval', () => {
    it('should be able to retrieve profile on valid credentials', async () => {
      const headers = { 'kasl-key': mock_user.kasl_key }

      const actual = await retrieveProfile(mockEvent({}, headers) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 200)
    })

    it('should return 401 error when no credentials passed', async () => {
      const actual = await retrieveProfile(mockEvent() as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 401)
    })

    it('should return 401 error on invalid credentials', async () => {
      const headers = { 'kasl-key': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' }

      const actual = await retrieveProfile(mockEvent({}, headers) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 401)
    })

    it('should handle 500 error', async () => {
      const headers = { 'kasl-key': 'xxx' }

      const actual = await retrieveProfile(mockEvent({}, headers) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 500)
    })
  })

  describe('Profile Update', () => {
    it('should be able to update profile on valid credentials', async () => {
      const headers = { 'kasl-key': mock_user.kasl_key }
      const body = {
        alternate_email: 'test+alternate@email.me',
        birthdate: '1980-02-29',
        gender: 'female',
        middle_name: 'Tully',
        phone: '+841234567890',
      }

      const actual = await updateProfile(mockEvent(body, headers) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 200)
      expect(actual).toHaveProperty('body')

      const actual_body = JSON.parse(actual.body)
      expect(actual_body).toHaveProperty('data')
      
      const actual_body_data = actual_body.data
      expect(actual_body_data).toHaveProperty('id', mock_user.id)
      expect(actual_body_data).toHaveProperty('alternate_email', body.alternate_email)
      expect(actual_body_data).toHaveProperty('birthdate', body.birthdate)
      expect(actual_body_data).toHaveProperty('gender', body.gender)
      expect(actual_body_data).toHaveProperty('middle_name', body.middle_name)
      expect(actual_body_data).toHaveProperty('phone', body.phone)
    })

    it('should return bad request on no payload', async () => {
      const headers = { 'kasl-key': mock_user.kasl_key }
      const body = {}

      const actual = await updateProfile(mockEvent(body, headers) as APIGatewayProxyEvent)
      expect(actual).toHaveProperty('statusCode', 400)
      expect(actual).toHaveProperty('body')

      const actual_body = JSON.parse(actual.body)
      expect(actual_body).toHaveProperty('error', HttpStatus.E_400)
    })

    it('should return invalid request if passing invalid fields', async () => {
      const headers = { 'kasl-key': mock_user.kasl_key }
      const body = {
        alternate_email: 'test',
        birthdate: '1980-02-32',
        gender: 'no_one',
        middle_name: 1,
        phone: '09170004444',
      }

      const actual = await updateProfile(mockEvent(body, headers) as APIGatewayProxyEvent)
      expect(actual).toHaveProperty('statusCode', 400)
      expect(actual).toHaveProperty('body')

      const actual_body = JSON.parse(actual.body)

      expect(actual_body).toHaveProperty('error', HttpStatus.E_400)
      expect(actual_body).toHaveProperty('errors')
      expect(actual_body.errors).toHaveLength(5)

      expect(actual_body.errors?.[0]).toHaveProperty('message', ErrorMessages.ALTERNATE_EMAIL_INVALID)
      expect(actual_body.errors?.[1]).toHaveProperty('message', ErrorMessages.BIRTHDATE_INVALID)
      expect(actual_body.errors?.[2]).toHaveProperty('message', ErrorMessages.GENDER_INVALID)
      expect(actual_body.errors?.[3]).toHaveProperty('message', ErrorMessages.MIDDLE_NAME_INVALID)
      expect(actual_body.errors?.[4]).toHaveProperty('message', ErrorMessages.PHONE_INVALID)
    })

    it('should return 401 error when no credentials passed', async () => {
      const actual = await updateProfile(mockEvent() as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 401)
    })

    it('should return 401 error on invalid credentials', async () => {
      const headers = { 'kasl-key': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' }
      const body = {
        middle_name: 'Tully',
      }

      const actual = await updateProfile(mockEvent(body, headers) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 401)
    })

    it('should handle 500 error', async () => {
      const headers = { 'kasl-key': 'xxx' }
      const body = {
        middle_name: 'Tully',
      }

      const actual = await updateProfile(mockEvent(body, headers) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 500)
    })

  })

  describe('Password Update', () => {
    it('should be able to update password on valid credentials', async () => {
      const headers = { 'kasl-key': mock_user.kasl_key }
      const body = {
        current_password: 'password',
        password: 'Password@12345',
        confirm_password: 'Password@12345',
      }

      const actual = await updateLogin(mockEvent(body, headers) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 200)
      expect(actual).toHaveProperty('body')

      const actual_body = JSON.parse(actual.body)
      expect(actual_body).toHaveProperty('data')
      
      const actual_body_data = actual_body.data
      expect(actual_body_data).toHaveProperty('id', mock_user.id)
      expect(actual_body_data).toHaveProperty('email', mock_user.email)
    })

    it('should return bad request on no payload', async () => {
      const headers = { 'kasl-key': mock_user.kasl_key }
      const body = {}

      const actual = await updateLogin(mockEvent(body, headers) as APIGatewayProxyEvent)
      expect(actual).toHaveProperty('statusCode', 400)
      expect(actual).toHaveProperty('body')

      const actual_body = JSON.parse(actual.body)
      expect(actual_body).toHaveProperty('error', HttpStatus.E_400)
    })

    it('should return invalid request if passing invalid fields', async () => {
      const headers = { 'kasl-key': mock_user.kasl_key }
      const body = {
        current_password: 'password',
        password: 'Password@12345',
        confirm_password: 'Password@12345678',
      }

      const actual = await updateLogin(mockEvent(body, headers) as APIGatewayProxyEvent)
      expect(actual).toHaveProperty('statusCode', 400)
      expect(actual).toHaveProperty('body')

      const actual_body = JSON.parse(actual.body)

      expect(actual_body).toHaveProperty('error', HttpStatus.E_400)
      expect(actual_body).toHaveProperty('errors')

      expect(actual_body.errors?.[0]).toHaveProperty('message', ErrorMessages.CONFIRM_PASSWORD_INVALID)
    })

    it('should return invalid request if not passing new password and confirm', async () => {
      const headers = { 'kasl-key': mock_user.kasl_key }
      const body = {
        current_password: 'password',
      }

      const actual = await updateLogin(mockEvent(body, headers) as APIGatewayProxyEvent)
      expect(actual).toHaveProperty('statusCode', 400)
      expect(actual).toHaveProperty('body')

      const actual_body = JSON.parse(actual.body)

      expect(actual_body).toHaveProperty('error', HttpStatus.E_400)
      expect(actual_body).toHaveProperty('errors')

      expect(actual_body.errors?.[0]).toHaveProperty('message', ErrorMessages.PASSWORD_REQUIRED)
      expect(actual_body.errors?.[1]).toHaveProperty('message', ErrorMessages.CONFIRM_PASSWORD_REQUIRED)
    })

    it('should return invalid request if passing invalid fields', async () => {
      const headers = { 'kasl-key': mock_user.kasl_key }
      const body = {
        current_password: 'password',
        password: 'password',
        confirm_password: 'password',
      }

      const actual = await updateLogin(mockEvent(body, headers) as APIGatewayProxyEvent)
      expect(actual).toHaveProperty('statusCode', 400)
      expect(actual).toHaveProperty('body')

      const actual_body = JSON.parse(actual.body)

      expect(actual_body).toHaveProperty('error', HttpStatus.E_400)
      expect(actual_body).toHaveProperty('errors')

      expect(actual_body.errors?.[0]).toHaveProperty('message', ErrorMessages.PASSWORD_WEAK)
    })

    it('should return 401 error when no credentials passed', async () => {
      const actual = await updateLogin(mockEvent() as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 401)
    })

    it('should return 401 error on invalid credentials', async () => {
      const headers = { 'kasl-key': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' }
      const body = {
        current_password: 'password',
        password: 'Password@12345',
        confirm_password: 'Password@12345',
      }

      const actual = await updateLogin(mockEvent(body, headers) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 401)
    })

    it('should handle 500 error', async () => {
      const headers = { 'kasl-key': 'xxx' }
      const body = {
        current_password: 'password',
        password: 'Password@12345',
        confirm_password: 'Password@12345',
      }

      const actual = await updateLogin(mockEvent(body, headers) as APIGatewayProxyEvent)

      expect(actual).toHaveProperty('statusCode', 500)
    })

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

const spyEnd = jest.fn()

jest.mock('massive', () =>
  jest.fn(() => ({
    instance: {
      $pool: {
        end: spyEnd,
      },
    },
    listTables: jest.fn(() => ['users']),
    withConnection: jest.fn(() => spyEnd),
    users: {
      findDoc: spyFindUsers,
      updateDoc: spyUpdateDoc,
    },
  })),
)

const getBodyString = JSON.stringify
const mockEvent = (
  data: {} = {},
  headers: {} = {},
  httpMethod: string = 'GET',
) => ({
  body: getBodyString(data),
  headers,
  httpMethod,
  multiValueHeaders: {},
})