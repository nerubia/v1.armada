import massive, { Database } from 'massive'

let db: Database

const initDb = async () => {
  const database_options = {
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  }

  try {
    db = await massive(database_options)
  } catch (error) {
    throw error
  }
}

export const getDatabase = async () => {
  if (db) {
    return db
  } else {
    await initDb()
    return db
  }
}

export const disconnectDb = async () => {
  db.instance.$pool.end()
}

/* istanbul ignore next */
export const doesDbTableExists = async (table_name: string) => {
  const db = await getDatabase()
  const tables = await db.listTables()

  if (tables.includes(table_name)) {
    return true
  }

  return false
}
