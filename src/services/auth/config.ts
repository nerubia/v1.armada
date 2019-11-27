export default async () => {
  if (process.env.NODE_ENV === 'test') {
    return {
      host: '1.1.1.1',
      port: 5432,
      database: 'armada_test',
      user: 'test_user',
      password: 'test_password',
    }
  }

  let port = 5433

  if (process.env.DATABASE_PORT) {
    port = parseInt(process.env.DATABASE_PORT, 10)
  }
  if (process.env.PGPORT) {
    port = parseInt(process.env.PGPORT, 10)
  }
  return {
    host: process.env.DATABASE_HOST,
    port,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  }
}
