import Cors = require('@koa/cors')
import AWS from 'aws-sdk'
import Koa = require('koa')
import bodyParser = require('koa-bodyparser')
import { Database } from 'massive'
import { Server } from 'net'
import { loadLocales } from './middlewares/locales'
import { loadServices } from './routes'

const app = new Koa()
app.use(
  Cors({
    allowHeaders: '*',
    exposeHeaders: ['kasl-key', 'client-secret', 'client-id'],
  }),
)

app.use(
  bodyParser({
    enableTypes: ['json', 'text'],
  }),
)

app.use(loadLocales)

interface KoaMassiveContext extends Koa.Context {
  db?: Database
}

const attachDB = (database: Database) => (
  ctx: KoaMassiveContext,
  next: () => {},
) => {
  ctx.db = database

  // Important to return next() for non-async middlewares
  return next()
}

const startApp = (database: Database): Server => {
  const aws_config = {
    access_key_id: process.env.AWS_ACCESS_KEY_ID,
    access_key_secret: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_DEFAULT_REGION,
  }
  AWS.config.update(aws_config)
  console.log('AWS configuration')
  console.log(JSON.stringify(aws_config, null, 2))

  // Attaches the database to app context
  app.use(attachDB(database))
  loadServices(app)

  console.log(`API listening to port: ${process.env.NODE_PORT}`)
  return app.listen(process.env.NODE_PORT).on('error', console.error)
}

export { app, attachDB, startApp }
