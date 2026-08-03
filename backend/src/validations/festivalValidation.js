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

  featuredTags: Joi.array()
    .items(Joi.string().trim())
    .default([]),

  featuredCollections: Joi.array().items(Joi.string()).default([]),

  heroBanners: Joi.array()
    .items(Joi.string().hex().length(24))
    .default([]),

  featuredSections: Joi.array().items(
    Joi.object({
      title: Joi.string().trim().max(150).allow('', null),
      description: Joi.string().trim().max(400).allow('', null),
      destinationType: Joi.string().valid('products', 'url').default('url'),
      destinationUrl: Joi.string().trim().max(500).allow('', null),
      products: Joi.array().items(Joi.string().hex().length(24)).default([]),
      displayOrder: Joi.number().min(0).default(0),
      isActive: Joi.boolean().default(true),
    })
  ).default([]),

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

  featuredTags: Joi.array()
    .items(Joi.string().trim())
    .default([]),

  featuredCollections: Joi.array().items(Joi.string()),

  heroBanners: Joi.array()
    .items(Joi.string().hex().length(24))
    .default([]),

  featuredSections: Joi.array().items(
    Joi.object({
      title: Joi.string().trim().max(150).allow('', null),
      description: Joi.string().trim().max(400).allow('', null),
      destinationType: Joi.string().valid('products', 'url').default('url'),
      destinationUrl: Joi.string().trim().max(500).allow('', null),
      products: Joi.array().items(Joi.string().hex().length(24)).default([]),
      displayOrder: Joi.number().min(0).default(0),
      isActive: Joi.boolean().default(true),
    })
  ).default([]),

  displayOrder: Joi.number().min(0),

  isActive: Joi.boolean(),
});