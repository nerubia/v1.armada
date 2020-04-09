import axios from 'axios'
import version from './version'

export const sitrep = async () => {
  const { data } = await axios.get('http://ifconfig.co', {
    headers: { 'content-type': 'application/json' },
  })
  console.log(data)
  const whitelist_ip = 'asd'
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `Life's a peach, eat more apples!`,
        whitelist_ip,
        version,
      },
      null,
      2,
    ),
  }
}
