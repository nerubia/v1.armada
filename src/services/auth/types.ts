export interface AuthHeaders {
  'client-id': string
  'client-secret': string
}

export interface Params {
  email: string
  password: string
}

export interface User {
  id?: number
  email: string
  password_hash: string
  logged_in_at?: string
  created_at: string
  updated_at?: string
}

export interface Results {
  id: number
  email: string
  'kasl-key': string
}

export interface Response {
  body: string
  headers: {
    [key: string]: string | boolean
  }
  statusCode: number
}
