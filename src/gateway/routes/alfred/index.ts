import {
  lambdaMiddleware,
  MethodTypes,
  KastleRouter,
  KastleRoutes,
} from '@g-six/kastle-router'
import { oauth } from 'services/alfred/handler'

const baseUrl = '/alfred'

const routes: KastleRoutes = {
  oauth: {
    method: MethodTypes.Get,
    route: '/',
    middlewares: [lambdaMiddleware(oauth)],
  },
}

export const Route: KastleRouter = {
  baseUrl,
  routes,
}
