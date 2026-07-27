import Joi from 'joi';

export const createFestivalSchema = Joi.object({
  name: Joi.string().trim().required().max(100),
  slug: Joi.string().trim().required().max(100).pattern(/^[a-z0-9-]+$/),
  enabled: Joi.boolean(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required().greater(Joi.ref('startDate')),

  heroTitle: Joi.string().trim().max(200).allow('', null),
  heroSubtitle: Joi.string().trim().max(500).allow('', null),

  primaryCtaText: Joi.string().trim().max(50).allow('', null),
  primaryCtaLink: Joi.string().trim().max(500).allow('', null),

  secondaryCtaText: Joi.string().trim().max(50).allow('', null),
  secondaryCtaLink: Joi.string().trim().max(500).allow('', null),

  deliveryMessage: Joi.string().trim().max(300).allow('', null),

  countdownDate: Joi.date().allow(null),

  landingPage: Joi.string().trim().max(100).allow('', null),

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

  upcomingFestival: Joi.string().allow(null, ''),

  displayOrder: Joi.number().min(0).default(0),

  isActive: Joi.boolean(),
});

export const updateFestivalSchema = Joi.object({
  name: Joi.string().trim().max(100),
  slug: Joi.string().trim().max(100).pattern(/^[a-z0-9-]+$/),
  enabled: Joi.boolean(),
  startDate: Joi.date(),
  endDate: Joi.date().greater(Joi.ref('startDate')),

  heroTitle: Joi.string().trim().max(200).allow('', null),
  heroSubtitle: Joi.string().trim().max(500).allow('', null),

  primaryCtaText: Joi.string().trim().max(50).allow('', null),
  primaryCtaLink: Joi.string().trim().max(500).allow('', null),

  secondaryCtaText: Joi.string().trim().max(50).allow('', null),
  secondaryCtaLink: Joi.string().trim().max(500).allow('', null),

  deliveryMessage: Joi.string().trim().max(300).allow('', null),

  countdownDate: Joi.date().allow(null),

  landingPage: Joi.string().trim().max(100).allow('', null),

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

  upcomingFestival: Joi.string().allow(null, ''),

  displayOrder: Joi.number().min(0),

  isActive: Joi.boolean(),
});