import { generateUri } from '@g-six/swiss-knife'
import pick from 'lodash/pick'
import massive from 'massive'

import {
  calculateOffset,
  calculatePageNumber,
  filterExactQueries,
  filterLikeQueries,
  paginationFilters,
  getTimeStamptz,
} from '../../src/utils'

import { ErrorMessages } from './constants'
import { Blog, BlogRecord, Params, Filters } from './types'

export const create = async (
  params: Blog,
  created_by: number,
  db: massive.Database,
) => {
  const [date] = new Date().toISOString().split('T')

  const slug = date + '-' + generateUri(params.title)

  const record = await db.saveDoc('blogs', {
    ...params,
    slug,
    created_by,
  })

  return record as BlogRecord
}

export const list = async (query: Filters, db: massive.Database) => {
  const {
    title,
    contents,
    parent_id,
    slug,

    // pagination specific payloads
    field,
    limit,
    offset,
    order,
    page,
    ...restPayload
  } = query

  const filterOptions = {
    field,
    limit,
    offset,
    order,
    page,
  }

  const queryFilter = {
    ...filterExactQueries(restPayload),
    ...filterLikeQueries(
      { title, contents, parent_id, slug },
      { wildcard: ['start', 'end'] },
    ),
  }

  const total = await db.contacts.countDoc(queryFilter)
  const records: BlogRecord[] = await db.contacts.findDoc(queryFilter, {
    ...paginationFilters(filterOptions),
  })

  return {
    records,
    limit: limit || 10,
    offset: calculateOffset(filterOptions),
    page: calculatePageNumber(filterOptions),
    total: Number(total),
  }
}

export const retrieve = async (id: number, db: massive.Database) => {
  const records = await db.blogs.findDoc(id)

  if (records.length === 0) {
    throw { message: ErrorMessages.BLOG_DOES_NOT_EXIST, status: 400 }
  }

  return records[0] as BlogRecord
}

export const update = async (
  id: number,
  updates: Params,
  updated_by: number,
  db: massive.Database,
) => {
  const input = pick(updates, ['contents', 'title'])

  const updated_at = getTimeStamptz(new Date())

  const rec = {
    ...input,
    updated_by,
    updated_at,
  }

  const records = await db.pages.updateDoc(id, rec)

  if (records.length === 0) {
    throw {
      message: ErrorMessages.BLOG_DOES_NOT_EXIST,
      status: 400,
    }
  }

  return records[0] as BlogRecord
}
