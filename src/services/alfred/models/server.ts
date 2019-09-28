import AWS from 'aws-sdk'

const aws_config = {
  access_key_id: process.env.AWS_ACCESS_KEY_ID,
  access_key_secret: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_DEFAULT_REGION,
}

AWS.config.update(aws_config)

const ec2 = new AWS.EC2()

const describeInstances = async (
  params: AWS.EC2.Types.DescribeInstancesRequest,
) => {
  return await ec2.describeInstances(params).promise()
}

export const list = async () => {
  const params: AWS.EC2.Types.DescribeInstancesRequest = {}
  const results = await describeInstances(params)
  if (!results) return false

  return results
}
