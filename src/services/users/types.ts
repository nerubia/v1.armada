export type InputParams = UpdatePasswordParams | UpdateProfileParams

export enum ErrorMessages {
  ALTERNATE_EMAIL_INVALID = 'error.alternate_email.invalid',
  BIRTHDATE_INVALID = 'error.birthdate.invalid',
  CONFIRM_PASSWORD_INVALID = 'error.confirm_password.invalid',
  CONFIRM_PASSWORD_REQUIRED = 'error.confirm_password.required',
  CURRENT_PASSWORD_INVALID = 'error.current_password.invalid',
  CURRENT_PASSWORD_REQUIRED = 'error.current_password.required',
  GENDER_INVALID = 'error.gender.invalid',
  MIDDLE_NAME_INVALID = 'error.middle_name.invalid',
  PHONE_INVALID = 'error.phone.invalid',
  PASSWORD_INVALID = 'error.password.invalid',
  PASSWORD_REQUIRED = 'error.password.required',
  PASSWORD_WEAK = 'error.password.weak',
}

export enum Genders {
  MALE = 'male',
  FEMALE = 'female',
}

export interface AuthHeaders {
  'client-id': string
  'client-secret': string
}

export interface Response {
  body: string
  headers: {
    [key: string]: string | boolean
  }
  statusCode: number
}

export interface UpdatePasswordParams {
  current_password: string
  password: string
  confirm_password: string
}

export interface UpdateProfileParams {
  alternate_email?: string
  birthdate?: string
  gender?: string
  middle_name?: string
  phone?: string
}

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  middle_name: string
  alternate_email: string
  gender: string
  birthdate: string
  phone: string
  kasl_key: string
  created_at: string
  updated_at: string
}

export interface UserCriteria {
  id?: number
  email?: string
  kasl_key?: string
}
