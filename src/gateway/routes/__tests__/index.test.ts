import App = require('koa')
import Router = require('koa-router')
import { loadRouteItem, loadServices } from '../'
import { MethodTypes } from '@g-six/kastle-router'

jest.genMockFromModule('koa')
jest.genMockFromModule('koa-router')

describe('loadServices', () => {
  const mockApp = new App()
  const spyUse = jest.spyOn(mockApp, 'use')

  it('should load routes routes() and allowedMethods() for each services', () => {
    loadServices(mockApp)
    expect(spyUse).toHaveBeenCalledTimes(6)
  })
})

describe('loadRouteItem', () => {
  const spyDelete = jest.fn()
  const spyGet = jest.fn()
  const spyPatch = jest.fn()
  const spyPost = jest.fn()
  const spyPut = jest.fn()

  Router.prototype.delete = spyDelete
  Router.prototype.get = spyGet
  Router.prototype.patch = spyPatch
  Router.prototype.post = spyPost
  Router.prototype.put = spyPut

  const KoaRouter = new Router({ prefix: '/sitrep' })

  it('should handle DELETE methods', () => {
    loadRouteItem(KoaRouter)({
      method: MethodTypes.Delete,
      route: '/sitrep',
      middlewares: [],
    })

    expect(spyDelete).toHaveBeenCalledWith('/sitrep')
  })

  it('should handle GET methods', () => {
    loadRouteItem(KoaRouter)({
      method: MethodTypes.Get,
      route: '/sitrep',
      middlewares: [],
    })

    expect(spyGet).toHaveBeenCalledWith('/sitrep')
  })
  it('should handle POST methods', () => {
    loadRouteItem(KoaRouter)({
      method: MethodTypes.Post,
      route: '/sitrep',
      middlewares: [],
    })

    expect(spyPost).toHaveBeenCalledWith('/sitrep')
  })
  it('should handle PATCH methods', () => {
    loadRouteItem(KoaRouter)({
      method: MethodTypes.Patch,
      route: '/sitrep',
      middlewares: [],
    })

    expect(spyPatch).toHaveBeenCalledWith('/sitrep')
  })
  it('should handle PUT methods', () => {
    loadRouteItem(KoaRouter)({
      method: MethodTypes.Put,
      route: '/sitrep',
      middlewares: [],
    })

    expect(spyPut).toHaveBeenCalledWith('/sitrep')
  })
})
