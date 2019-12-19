import { sub_categories } from './subcategories'
import { disconnectDb, getDatabase } from '../../utils/database'
import { create as createSubCategories } from '../../services/subcategories/model'
import { list as listCategories } from '../../services/categories/model'
import { SubCategory, Status } from '../../services/subcategories/types'
import { Database } from 'massive'
import { Categories } from '../../services/categories/types'

const insertSubCategories = async (categories: [], db: Database) => {
  for (let i = 0; i < sub_categories.length; i++) {
    console.log(`> Inserting "${sub_categories[i].name}" to db.....`)

    try {
      const category = categories.find(
        (c: Categories) => c.name === sub_categories[i].category,
      )

      if (category) {
        const { id: category_id } = category
        const params: SubCategory = {
          name: sub_categories[i].name,
          parent_category_name: sub_categories[i].category,
          parent_category_id: category_id,
          report_template: sub_categories[i].report_template,
          created_by: sub_categories[i].created_by,
          status: Status.ACTIVE,
        }

        await createSubCategories(params, db)
        console.log(`i "${sub_categories[i].name}" inserted to db.`)
      }
    } catch (error) {
      console.log(`x Error: ${error.errors}`)
    }
  }
}

const getCategories = async (db: Database) => {
  return await listCategories({}, db)
}

const run = async () => {
  const db = await getDatabase()
  const categories = await getCategories(db)

  await insertSubCategories(categories, db)
  await disconnectDb()
}

// main
run()
