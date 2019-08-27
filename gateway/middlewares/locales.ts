import { readdirSync, readFileSync } from 'fs'
import { safeLoad } from 'js-yaml'
import { BaseContext } from 'koa'
import { get } from 'lodash'
import { basename } from 'path'

interface Languages {
  [key: string]: Languages
}

const languages: Languages = {}

export const translate = (key: string, language: string = 'en') => {
  return get(languages, `${language}.${key}`, `${language}.${key}`)
}

export const loadLocales = async (
  ctx: BaseContext,
  next: () => {},
): Promise<void> => {
  await readLocales()

  ctx.__ = translate

  // Important to await next() for async functions
  await next()
}

export const readLocales = async (): Promise<void> => {
  const dir = 'gateway/locales'
  const files = await readdirSync(dir)

  for (let i = 0; i < files.length; i++) {
    if (files[i].split('.yaml').length === 2) {
      languages[basename(files[i], '.yaml')] = safeLoad(
        readFileSync(`${dir}/${files[i]}`, 'utf8'),
      )
    }
  }
}
