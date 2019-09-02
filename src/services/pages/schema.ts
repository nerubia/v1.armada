import Joi from '@hapi/joi'

export const schema = Joi.object().keys({
  title: Joi.string().required(),
  contents: Joi.string().required(),
})

