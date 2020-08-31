import { PaginationFilter } from '../../src/utils/ts/interfaces'

export interface Response {
  body: string
  headers: {
    [key: string]: string | boolean
  }
  statusCode: number
}
export interface Params {
  title?: string
  contents?: string
}

export interface Filters extends PaginationFilter {
  title?: string
  contents?: string
  parent_id?: number
  slug?: string
}

export interface ValidationError {
  errors: {
    [key: string]: string
  }
  statusCode: number
}

export interface Blog {
  title: string
  contents: string
  parent_id?: number
  slug?: string
}

export interface BlogRecord extends Blog {
  id: number
  created_at: Date
  created_by: number
  updated_at: Date
  updated_by: number
}
