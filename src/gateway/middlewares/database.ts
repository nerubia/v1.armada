import { BaseContext } from 'koa'
import massive from 'massive'
import Config from '../config'

export interface ConnectionOpts {
  database: string
  password: string
  user: string
  host?: string
  port?: number
  ssl?: boolean
}

export const connectDB = async (
  opts: ConnectionOpts,
): Promise<massive.Database> => {
  const connection: massive.ConnectionInfo = {
    ...opts,
    host: opts.host || 'localhost',
    port: opts.port || 5432,
    ssl: opts.ssl || false,
  }

  return await massive(connection)
}

export const loadDatabase = async (
  ctx: BaseContext,
  next: () => {},
): Promise<void> => {
  console.log('Connecting to database')
  console.log(Config.database)
  console.log(ctx.__)
  await connectDB(Config.database)
  next()
}
