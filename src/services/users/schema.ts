import Joi from '@hapi/joi'
import { Genders, ErrorMessages } from './types'
import { isGoodPassword } from '@g-six/swiss-knife-lite'

const pattern_date = /^(?:[1-9]\d{3}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\d|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[1-9]\d(?:0[48]|[2468][048]|[13579][26])|(?:[2468][048]|[13579][26])00)-02-29)$/
const pattern_phone = /^\+\d{11,}$/

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

export const password_update_schema = Joi.object().keys({
  current_password: Joi.string().required().messages({
    'any.required': ErrorMessages.CURRENT_PASSWORD_REQUIRED,
    'string.base': ErrorMessages.CURRENT_PASSWORD_INVALID,
    'string.empty': ErrorMessages.CURRENT_PASSWORD_REQUIRED,
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
      'any.only': ErrorMessages.CONFIRM_PASSWORD_INVALID,
      'string.base': ErrorMessages.CONFIRM_PASSWORD_INVALID,
      'string.empty': ErrorMessages.CONFIRM_PASSWORD_INVALID,
    }),
})

export const profile_update_schema = Joi.object().keys({
  alternate_email: Joi.string().optional().allow('').email().messages({
    'string.email': ErrorMessages.ALTERNATE_EMAIL_INVALID,
    'string.base': ErrorMessages.ALTERNATE_EMAIL_INVALID,
  }),
  birthdate: Joi.string().optional().allow('').pattern(pattern_date).messages({
    'string.pattern.base': ErrorMessages.BIRTHDATE_INVALID,
  }),
  gender: Joi.string()
    .optional()
    .allow('')
    .valid(Genders.MALE, Genders.FEMALE)
    .messages({
      'any.only': ErrorMessages.GENDER_INVALID,
      'string.base': ErrorMessages.GENDER_INVALID,
    }),
  middle_name: Joi.string().optional().allow('').messages({
    'string.base': ErrorMessages.MIDDLE_NAME_INVALID,
  }),
  phone: Joi.string().optional().allow('').pattern(pattern_phone).messages({
    'string.pattern.base': ErrorMessages.PHONE_INVALID,
  }),
})
