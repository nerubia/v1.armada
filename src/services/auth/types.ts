export enum Messages {
  EMAIL_TAKEN = 'error.email.taken',
  EXPIRED_KEY = 'error.key.expired',
  INVALID_KEY = 'error.key.invalid',
  INCORRECT_PASSWORD_CONFIRMATION = 'error.password_confirmation.mismatch',
  RECORD_NOT_FOUND = 'error.incorrect.or.not.found',
  INVALID_CREDENTIALS = 'error.invalid_credentials',
  UNVERIFIED_EMAIL = 'error.unverified_email',
  USER_NOT_FOUND = 'error.user_not_found',
}

export interface AuthHeaders {
  'client-id': string
  'client-secret': string
}

export interface EmailRecipient {
  email: string
  first_name: string
  last_name: string
}

export enum EmailTemplates {
  EMAIL_VERIFICATION = 'email-validation',
  FORGOT_PASSWORD = 'forgot-password',
}

export interface EmailTemplateParams {
  name: string
  content: string
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
  created_at: string
  email: string
  first_name: string
  is_activated: boolean
  last_name: string
  password_hash: string
  registered_at: string
  is_receiving_newsletter?: boolean
  logged_in_at?: string
  reset_requested_at?: string
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
