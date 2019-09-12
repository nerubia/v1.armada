export interface Response {
  body: string
  headers: {
    [key: string]: string | boolean
  }
  statusCode: number
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
