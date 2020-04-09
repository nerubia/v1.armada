export enum ErrorMessages {
  EMAIL_TAKEN = 'error.email.taken',
  EMAIL_REQUIRED = 'error.email.required',
  EMAIL_INVALID = 'error.email.invalid',
  EMAIL_UNVERIFIED = 'error.email.unverified',
  FIRST_NAME_REQUIRED = 'error.first_name.required',
  FIRST_NAME_INVALID = 'error.first_name.invalid',
  LAST_NAME_REQUIRED = 'error.last_name.required',
  LAST_NAME_INVALID = 'error.last_name.invalid',
  PASSWORD_WEAK = 'error.password.weak',
  PASSWORD_REQUIRED = 'error.password.required',
  PASSWORD_INVALID = 'error.password.invalid',
  CONFIRM_PASSWORD_MISMATCH = 'error.confirm_password.mismatch',
  CONFIRM_PASSWORD_REQUIRED = 'error.confirm_password.required',
  CONFIRM_PASSWORD_INVALID = 'error.confirm_password.invalid',
  KEY_EXPIRED = 'error.key.expired',
  KEY_INVALID = 'error.key.invalid',
  RECORD_NOT_FOUND = 'error.incorrect.or.not.found',
  INVALID_CREDENTIALS = 'error.invalid_credentials',
  USER_NOT_FOUND = 'error.user_not_found',
  BAD_REQUEST = 'error-client.bad-request',
}

export enum SuccessMessages {
  FORGOT_PASSWORD_CONFIRMATION = 'success.forgot_password_confirmation',
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

export interface SignupParams {
  email: string
  first_name: string
  last_name: string
  password: string
  confirm_password: string
  is_receiving_newsletter?: boolean
}

export interface ResetPasswordParams {
  id: number
  reset_key: string
  password: string
  confirm_password: string
}

export type InputParams = SignupParams | ResetPasswordParams

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
