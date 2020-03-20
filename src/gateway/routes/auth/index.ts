import {
  lambdaMiddleware,
  MethodTypes,
  KastleRouter,
  KastleRoutes,
} from '@g-six/kastle-router'
import { create, login } from 'services/auth/handler'

const baseUrl = '/auth'

const routes: KastleRoutes = {
  signup: {
    method: MethodTypes.Post,
    route: '/sign-up',
    middlewares: [lambdaMiddleware(create)],
  },
  login: {
    method: MethodTypes.Post,
    route: '/login',
    middlewares: [lambdaMiddleware(login)],
  },
}

export const Route: KastleRouter = {
  baseUrl,
  routes,
}
