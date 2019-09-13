import {
  lambdaMiddleware,
  MethodTypes,
  KastleRouter,
  KastleRoutes,
} from '@g-six/kastle-router'
import { create, list, retrieve, update } from 'services/pages/handler'

const baseUrl = '/pages'

const routes: KastleRoutes = {
  create: {
    method: MethodTypes.Post,
    route: '/',
    middlewares: [lambdaMiddleware(create)],
  },
  retrieve: {
    method: MethodTypes.Get,
    route: '/:identifier',
    middlewares: [lambdaMiddleware(retrieve)],
  },
  list: {
    method: MethodTypes.Get,
    route: '/',
    middlewares: [lambdaMiddleware(list)],
  },
  update: {
    method: MethodTypes.Put,
    route: '/:identifier',
    middlewares: [lambdaMiddleware(update)],
  },
}

export const Route: KastleRouter = {
  baseUrl,
  routes,
}
