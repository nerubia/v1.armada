import { HttpStatus } from '@g-six/kastle-router'
import { validateInput } from '../src/utils'

import { blog_schema as BlogSchema } from './schema'
import { Blog } from './types'

export async function validateBlogCreate(body: Blog) {
  const errors = await validateInput(body, BlogSchema)

  if (errors.length > 0) {
    throw {
      errors,
      message: HttpStatus.E_400,
      status: 400,
    }
  }
}
