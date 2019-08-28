import * as default_config from './defaults'
import { ConnectionOpts } from '../middlewares/database'

let overrides = {}

if (process.env.NODE_ENV) {
  if (['test'].indexOf(process.env.NODE_ENV) < 0) {
    // IMPORTANT!!!
    // Extract all environment variables here
    const {
      DATABASE_HOST: database_host,
      DATABASE_PORT: database_port,
      DATABASE_NAME: database_name,
      DATABASE_USER: database_user,
      DATABASE_PASSWORD: database_password,
    } = process.env
    const database: ConnectionOpts = {
      host: database_host as string,
      database: database_name as string,
      port: (database_port as unknown) as number,
      user: database_user as string,
      password: database_password as string,
    }

    overrides = {
      database,
    }
  }
}

export default {
  ...default_config,
  ...overrides,
}
