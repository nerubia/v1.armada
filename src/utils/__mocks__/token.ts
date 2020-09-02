/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */

const utils = require('../utils')

export const validateTokenSpy = jest.fn(() => ({ id: 1 }))

const originalValidateToken = utils.validateToken

utils.validateToken = validateTokenSpy

afterAll(() => {
  utils.validateToken = originalValidateToken
})
