export enum Categories {
  CASE_STUDIES = 'case-studies',
  CAREERS = 'careers',
  CUSTOMERS = 'customers',
  PARTNERS = 'partners',
  GOC = 'goc',
}

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

export interface Page {
  title: string
  category: Categories
  contents: string
  parent_id?: number
  order?: number
  slug?: string
}
