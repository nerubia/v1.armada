import Joi from '@hapi/joi'

export const schema = Joi.object().keys({
  contents: Joi.string().required(),
  order: Joi.number(),
  slug: Joi.string().min(2),
  title: Joi.string()
    .required()
    .min(2),
})
