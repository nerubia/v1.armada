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
  if (process.env.PGPORT) {
    port = parseInt(process.env.PGPORT, 10)
  }
  return {
    host: process.env.PGHOST,
    port,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
  }
}
