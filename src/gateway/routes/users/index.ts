import {
  lambdaMiddleware,
  MethodTypes,
  KastleRouter,
  KastleRoutes,
} from '@g-six/kastle-router'
import {
  retrieveProfile,
  updateLogin,
  updateProfile,
} from 'services/users/handler'

const baseUrl = '/users'

const routes: KastleRoutes = {
  retrieve_profile: {
    method: MethodTypes.Get,
    route: '/me',
    middlewares: [lambdaMiddleware(retrieveProfile)],
  },
  update_login: {
    method: MethodTypes.Put,
    route: '/me/auth',
    middlewares: [lambdaMiddleware(updateLogin)],
  },
  update_profile: {
    method: MethodTypes.Put,
    route: '/me',
    middlewares: [lambdaMiddleware(updateProfile)],
  },
}

export const Route: KastleRouter = {
  baseUrl,
  routes,
}
