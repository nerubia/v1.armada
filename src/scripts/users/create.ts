import { pick } from 'lodash'
import { HttpStatus } from '@g-six/kastle-router'
import { Database } from '@g-six/swiss-knife'
// import { create } from '../../services/categories/model'
// import { Categories } from '../../services/categories/types'
export const hash = (input: string) => {
  return require('crypto')
    .createHmac('sha256', input)
    .update(process.env.APP_SECRET)
    .digest('base64')
}

const insertUsers = async () => {
  const db = await Database.getDatabase()
  const [email, password] = process.argv.splice(2)
  let user

  if (!email || !password) {
    console.error('Please provide email and password')
  } else {
    console.log(`> Inserting "${email}" to db.....`)
    const [date, ttz] = new Date().toISOString().split('T')
    const time = ttz.substr(0, 8)
    const tables = await db.listTables()
    const record = {
      email,
      password,
    }

    if (tables.indexOf('users') >= 0) {
      const records = await db.users.findDoc(pick(record, ['email']))

      if (records.length >= 1) {
        throw { message: HttpStatus.E_400, status: 400 }
      }
    }
    user = await db.saveDoc('users', {
      email: record.email,
      password_hash: hash(record.password),
      created_at: [date, time].join(' '),
    })
  }

  console.log(!!db)
  console.log(email, password)

  await Database.disconnectDb()
  console.log(pick(user, ['id', 'email', 'created_at']))
}

// main
insertUsers()
