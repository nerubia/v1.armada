export default async (Names: string[]) => {
  if (process.env.NODE_ENV === 'test') {
    return {
      host: 'localhost',
      port: 5432,
      database: 'armada_test',
      user: 'test_user',
      password: 'test_password',
    }
  }
  return {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
  }
}
