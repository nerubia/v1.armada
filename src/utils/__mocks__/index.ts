/* eslint-disable @typescript-eslint/no-explicit-any */

export const unmockAll = () => {
  // Unmocks Database
  jest.unmock('@g-six/swiss-knife')

  // Unmocks model
  jest.unmock('./model')
}

const getBodyString = (httpMethod: string, data: any) => {
  if (!data) return {}
  switch (httpMethod) {
    case 'GET':
    case 'HEAD':
      return {
        queryStringParameters: data,
      }
    default:
      return { body: JSON.stringify(data) }
  }
}

export const mockEvent = (
  data: any,
  headers: {} = {},
  httpMethod = 'POST',
): any => ({
  ...getBodyString(httpMethod, data),
  headers,
  httpMethod,
  multiValueHeaders: {},
})
