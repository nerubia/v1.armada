import * as Koa from 'koa'
import Router = require('koa-router')
import { KastleRouter, KastleRoute, MethodTypes } from '@g-six/kastle-router'
import { Route as Auth } from './auth'
import { Route as Sitrep } from './general'
import { Route as Pages } from './pages'

export const loadRouteItem = (router: Router) => {
  return (route_item: KastleRoute) => {
    const { method, route, middlewares } = route_item

    switch (method) {
      case MethodTypes.Delete:
        router.delete(route, ...middlewares)
        break
      case MethodTypes.Get:
        router.get(route, ...middlewares)
        break
      case MethodTypes.Post:
        router.post(route, ...middlewares)
        break
      case MethodTypes.Patch:
        router.patch(route, ...middlewares)
        break
      case MethodTypes.Put:
        router.put(route, ...middlewares)
        break
    }
  }
}

export const loadRoutes = (app: Koa) => {
  return (router: KastleRouter) => {
    const { routes, baseUrl } = router
    const KoaRouter = new Router({ prefix: baseUrl })

    Object.values(routes).forEach(loadRouteItem(KoaRouter))

    app.use(KoaRouter.routes()).use(KoaRouter.allowedMethods())
  }
}

export const loadServices = (app: Koa) => {
  loadRoutes(app)(Sitrep)
  loadRoutes(app)(Auth)
  loadRoutes(app)(Pages)
}
