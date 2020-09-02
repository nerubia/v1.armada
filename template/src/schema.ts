import Joi from '@hapi/joi'
import { ErrorMessages } from './constants'

export const blog_schema = {
  contents: Joi.string().required().messages({
    'string.base': ErrorMessages.CONTENT_INVALID,
    'any.required': ErrorMessages.CONTENT_REQUIRED,
  }),
  order: Joi.number().messages({
    'number.base': ErrorMessages.ORDER_INVALID,
  }),
  slug: Joi.string().min(2).messages({
    'string.base': ErrorMessages.SLUG_INVALID,
    'string.min': ErrorMessages.SLUG_MIN,
  }),
  title: Joi.string().required().min(2).messages({
    'string.base': ErrorMessages.TITLE_INVALID,
    'string.min': ErrorMessages.TITLE_MIN,
    'any.required': ErrorMessages.TITLE_REQUIRED,
  }),
}
