import {
  lambdaMiddleware,
  MethodTypes,
  KastleRouter,
  KastleRoutes,
} from '@g-six/kastle-router'
import {
  activate,
  create,
  forgot,
  login,
  resendActivation,
  resetPassword,
} from 'services/auth/handler'

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
  resetPassword: {
    method: MethodTypes.Put,
    route: '/reset-password',
    middlewares: [lambdaMiddleware(resetPassword)],
  },
  activate: {
    method: MethodTypes.Post,
    route: '/activate',
    middlewares: [lambdaMiddleware(activate)],
  },
  forgot: {
    method: MethodTypes.Post,
    route: '/forgot-password',
    middlewares: [lambdaMiddleware(forgot)],
  },
  resend_activation: {
    method: MethodTypes.Post,
    route: '/resend-activation',
    middlewares: [lambdaMiddleware(resendActivation)],
  },
}

export const Route: KastleRouter = {
  baseUrl,
  routes,
}
