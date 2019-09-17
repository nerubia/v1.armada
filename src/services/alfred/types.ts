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

export interface SlackOAuthInterface {
  SLACK_CLIENT_ID: string
  SLACK_CLIENT_SECRET: string
}
