/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */

const getDatabaseSpy = jest.fn(() => ({
  saveDoc: saveDocSpy,
  listTables: listTablesSpy,
  tokens: {
    countDoc: countDocSpy,
    find: findSpy,
    findDoc: findDocSpy,
    updateDoc: updateDocSpy,
  },
  users: {
    countDoc: countDocSpy,
    find: findSpy,
    findDoc: findDocSpy,
    updateDoc: updateDocSpy,
  },
}))

const Database = {
  getDatabase: getDatabaseSpy,
  disconnectDb: jest.fn(),
}

jest.doMock('@g-six/swiss-knife', () => ({
  Database,
}))

export const listTablesSpy = jest.fn((): string[] => [])
export const countDocSpy = jest.fn((count): string => count)
export const findSpy = jest.fn((): any[] => [])
export const findDocSpy = jest.fn((): any[] => [])
export const findOneSpy = jest.fn((result: any) => result)
export const updateDocSpy = jest.fn((): any[] => [])
export const searchDocSpy = jest.fn((): any[] => [])
export const whereSpy = jest.fn((): any[] => [])

export const saveDocSpy = jest.fn((_: string, parameters: object) => ({
  ...(parameters || {}),
}))

export const saveDocsSpy = jest.fn((parameters: [object]) => parameters || [])

export const destroySpy = jest.fn((parameters: object) => parameters || [])
