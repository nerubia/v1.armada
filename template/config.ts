import SSM from 'aws-sdk/clients/ssm'

interface SSMParameter {
  Name: string
  Value: string
}
interface SSMParameters {
  Parameters: SSMParameter[]
}

export default async (Names: string[]) => {
  const ssm = new SSM()
  const getParameters = ssm.getParameters({ Names })

  const response: SSM.Types.GetParametersResult = await getParameters.promise()

  const { Parameters } = response as SSMParameters
  const values = {}
  Parameters.forEach(({ Name, Value }) => {
    if (Name === 'PGHOST') values['host'] = Value
    if (Name === 'PGPORT') values['port'] = Value
    if (Name === 'PGDATABASE') values['database'] = Value
    if (Name === 'PGUSER') values['user'] = Value
    if (Name === 'PGPASSWORD') values['password'] = Value
  })

  return values
}
