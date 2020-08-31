export interface DecodedToken {
  id: string
  object_id: string
}

export interface ErrorCatch {
  status: number
  message: string
  stack: string
  errors: object[]
}

export interface Response {
  body: string
  headers: {
    [key: string]: string | boolean
  }
  statusCode: number
}

export interface QueryFilterOption {
  include_empty?: boolean
  wildcard?: string[]
}

export interface PaginationResponse<T> {
  total: number
  limit: number
  offset: number
  records: T[]
}

export interface PaginationFilter {
  field?: string
  limit?: number
  offset?: number
  order?: string
  page?: number
}

export interface UserRecord {
  id: number
  username: string
  first_name: string
  family_name: string
  email: string
}

export interface ValidationError {
  field: string | number
  message: string
  type: string
}
