import {
  lambdaMiddleware,
  MethodTypes,
  KastleRouter,
  KastleRoutes,
} from '@g-six/kastle-router'
import { create, list, retrieve } from 'services/pages/handler'

const baseUrl = '/pages'

const routes: KastleRoutes = {
  create: {
    method: MethodTypes.Post,
    route: '/',
    middlewares: [lambdaMiddleware(create)],
  },
  retrieve: {
    method: MethodTypes.Get,
    route: '/:page_id',
    middlewares: [lambdaMiddleware(retrieve)],
  },
  list: {
    method: MethodTypes.Get,
    route: '/',
    middlewares: [lambdaMiddleware(list)],
  },
}

export const Route: KastleRouter = {
  baseUrl,
  routes,
}
