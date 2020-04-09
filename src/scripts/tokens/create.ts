import { pick } from 'lodash'
import { Database } from '@g-six/swiss-knife'

export const hash = (input: string) => {
  return require('crypto')
    .createHmac('sha256', input)
    .update(process.env.APP_SECRET)
    .digest('base64')
}

const create = async () => {
  const db = await Database.getDatabase()
  const [domain] = process.argv.splice(2)
  let token

  if (!domain) {
    console.error('Please provide domain')
  } else {
    console.log(`> Creating token for "${domain}".....`)
    const [date, ttz] = new Date().toISOString().split('T')
    const time = ttz.substr(0, 8)
    const tables = await db.listTables()
    if (tables.indexOf('tokens') >= 0) {
      const records = await db.tokens.findDoc({ domain })

      if (records.length >= 1) {
        console.error('\n\nRecord exists')
        console.log(records)
        console.log('\n\n\n')
        return
      }
    }
    const client_id = hash(domain)
    token = await db.saveDoc('tokens', {
      domain,
      client_id,
      client_secret: hash(
        [date, domain, time, client_id.split(9, 19)].join('.'),
      ),
      created_at: [date, time].join(' '),
    })
  }

  console.log(!!db)

  await Database.disconnectDb()
  console.log(
    pick(token, ['id', 'client_id', 'client_secret', 'domain', 'created_at']),
  )
}

// main
create()
