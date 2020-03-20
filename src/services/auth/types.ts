export interface AuthHeaders {
  'client-id': string
  'client-secret': string
}

export interface Params {
  email: string
  first_name: string
  last_name: string
  password: string
  confirm_password: string
  is_receiving_newsletter?: boolean
}

export interface User {
  id?: number
  email: string
  first_name: string
  last_name: string
  password_hash: string
  is_activated: boolean
  is_receiving_newsletter?: boolean
  registered_at: string
  logged_in_at?: string
  created_at: string
  updated_at?: string
}

export interface Results {
  id: number
  email: string
  first_name: string
  last_name: string
  'kasl-key': string
}

export interface Response {
  body: string
  headers: {
    [key: string]: string | boolean
  }
  statusCode: number
}
