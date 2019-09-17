import Axios from 'axios'
import getEnv from './config'
import { stringify } from 'querystring'
import { SlackOAuthInterface } from './types'

export const exchangeCode = async (code: string): Promise<string> => {
  const {
    SLACK_CLIENT_ID: client_id,
    SLACK_CLIENT_SECRET: client_secret,
  } = (await getEnv([
    'SLACK_CLIENT_ID',
    'SLACK_CLIENT_SECRET',
    'SLACK_REDIRECT_URL',
  ])) as SlackOAuthInterface

  const payload = stringify({
    client_id,
    client_secret,
    code,
  })

  const results = await Axios.post(
    'https://slack.com/api/oauth.access',
    payload,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  )

  return results && results.data ? JSON.stringify(results.data, null, 2) : ''
}

export const access = async (code: string) => {
  const results = await exchangeCode(code)

  if (!results) return false

  return JSON.parse(results)
}
