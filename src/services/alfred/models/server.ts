import AWS from 'aws-sdk'

const aws_config = {
  credentials: {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
  },
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
