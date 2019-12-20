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

export interface Filters extends Params {
  parent_id?: number
  limit?: number
  order?: number
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
  order?: number
  slug?: string
}
