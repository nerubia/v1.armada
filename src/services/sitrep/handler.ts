import axios from 'axios'
import version from './version'

export const sitrep = async () => {
  const { data } = await axios.get('http://ipinfo.io/json', {
    headers: { 'content-type': 'application/json' },
  })
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        ...data,
        message: `Life's a peach, eat more apples!`,
        version,
      },
      null,
      2,
    ),
  }
}
