export const hash = (input: string) => {
  return require('crypto')
    .createHmac('sha256', input)
    .update(process.env.SECRET)
    .digest('base64')
}

export const generateKey = (length: number = 30) => {
  let result = ''
  const upcases = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowcases = 'abcdefghijklmnopqrstuvwxyz'
  const nums = '0123456789'
  let characters = [upcases, lowcases, nums].join('')
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  return result
}
