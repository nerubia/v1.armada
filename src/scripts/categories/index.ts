import { categories } from './categories'
import { disconnectDb, getDatabase } from '../../utils/database'
import { create } from '../../services/categories/model'
import { Categories } from '../../services/categories/types'

const insertCategories = async () => {
  const db = await getDatabase()

  for (let i = 0; i < categories.length; i++) {
    console.log(`> Inserting "${categories[i].name}" to db.....`)

    try {
      const params: Categories = {
        name: categories[i].name,
      }

      await create(params, categories[i].created_by, db)
      console.log(`i "${categories[i].name}" inserted to db.`)
    } catch (error) {
      console.log(`x Error: ${error.errors}`)
    }
  }

  await disconnectDb()
}

// main
insertCategories()
