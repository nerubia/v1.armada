/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */

jest.doMock('../model', () => ({
  create: createSpy,
  list: listSpy,
  retrieve: retrieveSpy,
  update: updateSpy,
}))

export const createSpy = jest.fn((payload) => {
  return {
    ...payload,
  }
})

export const listSpy = jest.fn((): any[] => [])
export const retrieveSpy = jest.fn((payload) => payload)

export const updateSpy = jest.fn((payload) => payload)
