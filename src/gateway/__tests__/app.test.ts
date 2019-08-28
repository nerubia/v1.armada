import Koa = require('koa')
import { Database } from 'massive'
import { Server } from 'net'
import { startApp, attachDB } from '../app'

describe('startApp', (): void => {
  let app: Server

  afterEach((): void => {
    // Important!!! Close connection to avoid port
    // conflict errors
    app.close()
  })

  it('should start app', (): void => {
    app = startApp(({} as unknown) as Database)
    expect(app.listening).toBe(true)
  })
})

interface KoaMassiveContext extends Koa.Context {
  db?: Database
}
describe('attachDB', (): void => {
  it('should add db to context', (): void => {
    const ctx = ({
      db: {},
    } as unknown) as KoaMassiveContext
    const spyNext = jest.fn()
    attachDB(({} as unknown) as Database)(ctx, spyNext)
    expect(spyNext).toHaveBeenCalled()
    expect(ctx.db).toEqual({})
  })
})
