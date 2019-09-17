import SSM from 'aws-sdk/clients/ssm'

interface SSMParameter {
  Name: string
  Value: string
}
interface SSMParameters {
  Parameters: SSMParameter[]
}

export default async (Names: string[]) => {
  if (process.env.NODE_ENV === 'local') {
    return {
      SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID,
      SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET,
      SLACK_REDIRECT_URL: process.env.SLACK_REDIRECT_URL,
    }
  }

  if (process.env.NODE_ENV === 'test') {
    return {
      SLACK_CLIENT_ID: 'process.env.SLACK_CLIENT_ID',
      SLACK_CLIENT_SECRET: 'process.env.SLACK_CLIENT_SECRET',
      SLACK_REDIRECT_URL: 'process.env.SLACK_REDIRECT_URL',
    }
  }
  const ssm = new SSM()
  const getParameters = ssm.getParameters({ Names })

  const response: SSM.Types.GetParametersResult = await getParameters.promise()

  const { Parameters } = response as SSMParameters
  const values = {}
  Parameters.forEach(({ Name, Value }) => {
    if (Name === 'SLACK_CLIENT_ID') values['SLACK_CLIENT_ID'] = Value
    if (Name === 'SLACK_CLIENT_SECRET') values['SLACK_CLIENT_SECRET'] = Value
    if (Name === 'SLACK_REDIRECT_URL') values['SLACK_REDIRECT_URL'] = Value
    console.log(Name)
  })

  return values
}
