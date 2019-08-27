import { KastleContext } from '@g-six/kastle-router'

export interface SitrepResponse {
  message: string
}

export interface SitrepContext extends KastleContext<SitrepResponse> {}
