import {
  lambdaMiddleware,
  MethodTypes,
  KastleRouter,
  KastleRoutes,
} from '@g-six/kastle-router'
import { retrieve } from 'services/pages/handler'

const baseUrl = '/pages'

const routes: KastleRoutes = {
  retrieve: {
    method: MethodTypes.Get,
    route: '/',
    middlewares: [lambdaMiddleware(retrieve)],
  },
}

export const Route: KastleRouter = {
  baseUrl,
  routes,
}
