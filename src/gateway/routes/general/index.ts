import {
  lambdaMiddleware,
  MethodTypes,
  KastleRouter,
  KastleRoutes,
} from '@g-six/kastle-router'
import { sitrep } from 'services/general/handler'

const baseUrl = '/sitrep'

const routes: KastleRoutes = {
  sitrep: {
    method: MethodTypes.Get,
    route: '/',
    middlewares: [lambdaMiddleware(sitrep)],
  },
}

export const Route: KastleRouter = {
  baseUrl,
  routes,
}
