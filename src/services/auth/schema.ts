import Joi from '@hapi/joi'
import { isGoodPassword } from '@g-six/swiss-knife-lite'
import { ErrorMessages } from './types'

const validatePassword = (p: string) => {
  const {
    has_lower,
    has_number,
    has_special,
    has_upper,
    is_long_enough,
  } = isGoodPassword(p, 8)

  if (
    !has_lower ||
    !has_number ||
    !has_special ||
    !has_upper ||
    !is_long_enough
  ) {
    throw Error(ErrorMessages.PASSWORD_WEAK)
  }

  return p
}

export const signup_schema = Joi.object().keys({
  email: Joi.string().email().required().messages({
    'any.required': ErrorMessages.EMAIL_REQUIRED,
    'string.email': ErrorMessages.EMAIL_INVALID,
    'string.base': ErrorMessages.EMAIL_INVALID,
    'string.empty': ErrorMessages.EMAIL_REQUIRED,
  }),
  first_name: Joi.string().required().messages({
    'any.required': ErrorMessages.FIRST_NAME_REQUIRED,
    'string.base': ErrorMessages.FIRST_NAME_INVALID,
    'string.empty': ErrorMessages.FIRST_NAME_REQUIRED,
  }),
  last_name: Joi.string().required().messages({
    'any.required': ErrorMessages.LAST_NAME_REQUIRED,
    'string.base': ErrorMessages.LAST_NAME_INVALID,
    'string.empty': ErrorMessages.LAST_NAME_REQUIRED,
  }),
  password: Joi.string()
    .required()
    .strip()
    .custom(validatePassword, 'custom validation')
    .messages({
      'any.custom': ErrorMessages.PASSWORD_WEAK,
      'any.required': ErrorMessages.PASSWORD_REQUIRED,
      'string.base': ErrorMessages.PASSWORD_INVALID,
      'string.empty': ErrorMessages.PASSWORD_REQUIRED,
    }),
  confirm_password: Joi.string()
    .required()
    .strip()
    .equal(Joi.ref('password'))
    .messages({
      'any.required': ErrorMessages.CONFIRM_PASSWORD_REQUIRED,
      'any.only': ErrorMessages.CONFIRM_PASSWORD_MISMATCH,
      'string.base': ErrorMessages.CONFIRM_PASSWORD_INVALID,
      'string.empty': ErrorMessages.CONFIRM_PASSWORD_REQUIRED,
    }),
  is_receiving_newsletter: Joi.boolean().optional(),
})

export const reset_password_schema = Joi.object().keys({
  id: Joi.number().required().messages({
    'number.base': ErrorMessages.BAD_REQUEST,
    'any.required': ErrorMessages.BAD_REQUEST,
  }),
  reset_key: Joi.string().required().messages({
    'string.base': ErrorMessages.BAD_REQUEST,
    'any.required': ErrorMessages.BAD_REQUEST,
    'string.empty': ErrorMessages.BAD_REQUEST,
  }),
  password: Joi.string()
    .required()
    .strip()
    .custom(validatePassword, 'custom validation')
    .messages({
      'any.custom': ErrorMessages.PASSWORD_WEAK,
      'any.required': ErrorMessages.PASSWORD_REQUIRED,
      'string.base': ErrorMessages.PASSWORD_INVALID,
      'string.empty': ErrorMessages.PASSWORD_REQUIRED,
    }),
  confirm_password: Joi.string()
    .required()
    .strip()
    .equal(Joi.ref('password'))
    .messages({
      'any.required': ErrorMessages.CONFIRM_PASSWORD_REQUIRED,
      'any.only': ErrorMessages.CONFIRM_PASSWORD_MISMATCH,
      'string.base': ErrorMessages.CONFIRM_PASSWORD_INVALID,
      'string.empty': ErrorMessages.CONFIRM_PASSWORD_REQUIRED,
    }),
})
