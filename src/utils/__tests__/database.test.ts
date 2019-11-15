jest.mock('massive', () => {
  return async (db_config: any): Promise<{}> => {
    return Promise.resolve({
      listTables: () => ['yes_i_do']
    })
  }
})

import { doesDbTableExists, getDatabase } from '../database'

describe('Database connection util', () => {
  it('should return the database connection', async () => {
    const connection = await getDatabase()

    expect(connection).toBeTruthy()
  })

  describe('doesDbTableExists', () => {
    it('should return false if table does not exist', async () => {
      const actual = await doesDbTableExists('no_i_donut')
      expect(actual).toBeFalsy()
    })
  })
})

