export default () => {
  const values = {}
  values['AWS_ACCESS_KEY_ID'] = process.env.AWS_ACCESS_KEY_ID
  values['AWS_SECRET_ACCESS_KEY'] = process.env.AWS_SECRET_ACCESS_KEY
  values['SLACK_CLIENT_ID'] = process.env.SLACK_CLIENT_ID
  values['SLACK_CLIENT_SECRET'] = process.env.SLACK_CLIENT_SECRET
  values['SLACK_REDIRECT_URL'] = process.env.SLACK_REDIRECT_URL

  if (process.env.NODE_ENV === 'test') {
    return {
      AWS_ACCESS_KEY_ID: 'process.env.AWS_ACCESS_KEY_ID',
      AWS_SECRET_ACCESS_KEY: 'process.env.AWS_SECRET_ACCESS_KEY',
      SLACK_CLIENT_ID: 'process.env.SLACK_CLIENT_ID',
      SLACK_CLIENT_SECRET: 'process.env.SLACK_CLIENT_SECRET',
      SLACK_REDIRECT_URL: 'process.env.SLACK_REDIRECT_URL',
    }
  }

  return values
}
