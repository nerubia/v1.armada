import {
  lambdaMiddleware,
  MethodTypes,
  KastleRouter,
  KastleRoutes,
} from '@g-six/kastle-router'
import { oauth, listServers } from 'services/alfred/handler'

const baseUrl = '/alfred'

const routes: KastleRoutes = {
  oauth: {
    method: MethodTypes.Get,
    route: '/',
    middlewares: [lambdaMiddleware(oauth)],
  },
  server_list: {
    method: MethodTypes.Get,
    route: '/servers',
    middlewares: [lambdaMiddleware(listServers)],
  },
}

export const Route: KastleRouter = {
  baseUrl,
  routes,
}
