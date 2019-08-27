import { BaseContext } from 'koa'

import { loadLocales, translate } from '../locales'

describe('locales.translate', () => {
  test('should list supported locales (based on yml files)', async () => {
    const ctx = ({
      __: jest.fn(),
    } as unknown) as BaseContext

    const next = jest.fn()

    await loadLocales(ctx, next)

    const result = await translate('auth.authenticate')
    expect(result).toEqual('Authenticate')
  })
})
