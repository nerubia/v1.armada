export const hash = (input: string) => {
  return require('crypto')
    .createHmac('sha256', input)
    .update(process.env.APP_SECRET)
    .digest('base64')
}
