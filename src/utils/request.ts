import { HttpStatus } from '@g-six/kastle-router'

export async function validateEventBody(body?: string | null) {
  if (!body || body === '{}') {
    throw {
      message: HttpStatus.E_400,
      status: 400,
    }
  }
}
