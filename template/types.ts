export interface Response {
  body: string
  headers: {
    [key: string]: string | boolean
  }
  statusCode: number
}
