/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */

const utils = require('../utils')

export const sendTemplatedEmailSpy = jest.fn(() => ({ id: 1 }))

const originalSendTemplatedEmail = utils.sendTemplatedEmail

utils.sendTemplatedEmail = sendTemplatedEmailSpy

afterAll(() => {
  utils.validateToken = originalSendTemplatedEmail
})
