import Joi from 'joi';

export const createFestivalSchema = Joi.object({
  name: Joi.string().trim().required().max(100),
  slug: Joi.string().trim().required().max(100).pattern(/^[a-z0-9-]+$/),
  enabled: Joi.boolean(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required().greater(Joi.ref('startDate')),
  themeColor: Joi.string()
    .trim()
    .max(20)
    .default('#C8A46B'),
  announcement: Joi.object({
    enabled: Joi.boolean(),
    message: Joi.string().trim().max(200).allow('', null),
    linkText: Joi.string().trim().max(40).allow('', null),
    linkUrl: Joi.string().trim().max(500).allow('', null),
    backgroundColor: Joi.string().trim().max(20).allow('', null),
    textColor: Joi.string().trim().max(20).allow('', null),
    dismissible: Joi.boolean(),
  }),

  featuredProducts: Joi.array().items(Joi.string()).default([]),

  featuredCollections: Joi.array().items(Joi.string()).default([]),

  displayOrder: Joi.number().min(0).default(0),

  isActive: Joi.boolean(),
});

export const updateFestivalSchema = Joi.object({
  name: Joi.string().trim().max(100),
  slug: Joi.string().trim().max(100).pattern(/^[a-z0-9-]+$/),
  enabled: Joi.boolean(),
  startDate: Joi.date(),
  endDate: Joi.date().greater(Joi.ref('startDate')),
  themeColor: Joi.string()
    .trim()
    .max(20)
    .default('#C8A46B'),
  announcement: Joi.object({
    enabled: Joi.boolean(),
    message: Joi.string().trim().max(200).allow('', null),
    linkText: Joi.string().trim().max(40).allow('', null),
    linkUrl: Joi.string().trim().max(500).allow('', null),
    backgroundColor: Joi.string().trim().max(20).allow('', null),
    textColor: Joi.string().trim().max(20).allow('', null),
    dismissible: Joi.boolean(),
  }),

  featuredProducts: Joi.array().items(Joi.string()),

  featuredCollections: Joi.array().items(Joi.string()),

  displayOrder: Joi.number().min(0),

  isActive: Joi.boolean(),
});