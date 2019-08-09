import { Handler, Context, Callback } from 'aws-lambda'

interface HealthResponse {
  statusCode: number
  body: string
}

const health: Handler = (event: any, context: Context, callback: Callback) => {
  const response: HealthResponse = {
    statusCode: 200,
    body: JSON.stringify({
      message: `Life's a peach, eat more apples`,
    }),
  }

  callback(undefined, response)
}

export { health }
