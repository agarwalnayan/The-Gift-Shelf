import Joi from 'joi';

const objectId = Joi.string().trim().hex().length(24);

// ---- Banners (hero + promo) ----
export const createBannerSchema = Joi.object({
  type: Joi.string().valid('hero', 'promo').required(),
  title: Joi.string().trim().max(150).allow('', null),
  subtitle: Joi.string().trim().max(200).allow('', null),
  description: Joi.string().trim().max(400).allow('', null),
  ctaText: Joi.string().trim().max(40).allow('', null),
  ctaLink: Joi.string().trim().max(300).allow('', null),
  displayOrder: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
  startDate: Joi.date().allow('', null),
  endDate: Joi.date().allow('', null),
  image: Joi.any().optional(),
  mobileImage: Joi.any().optional(),
}).unknown(false);

export const updateBannerSchema = Joi.object({
  type: Joi.string().valid('hero', 'promo'),
  title: Joi.string().trim().max(150).allow('', null),
  subtitle: Joi.string().trim().max(200).allow('', null),
  description: Joi.string().trim().max(400).allow('', null),
  ctaText: Joi.string().trim().max(40).allow('', null),
  ctaLink: Joi.string().trim().max(300).allow('', null),
  displayOrder: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
  startDate: Joi.date().allow('', null),
  endDate: Joi.date().allow('', null),
  image: Joi.any().optional(),
  mobileImage: Joi.any().optional(),
  removeImage: Joi.boolean(),
  removeMobileImage: Joi.boolean(),
}).unknown(false);

// ---- Featured items (recipient + occasion) ----
export const createFeaturedItemSchema = Joi.object({
  type: Joi.string().valid('recipient', 'occasion').required(),
  name: Joi.string().trim().min(1).max(80).required(),
  value: Joi.string().trim().min(1).max(80).required(),
  displayOrder: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
  image: Joi.any().optional(),
}).unknown(false);

export const updateFeaturedItemSchema = Joi.object({
  name: Joi.string().trim().min(1).max(80),
  value: Joi.string().trim().min(1).max(80),
  displayOrder: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
  image: Joi.any().optional(),
}).unknown(false);

// ---- Budget collections (fixed 3 tiers, upsert by tier) ----
export const upsertBudgetCollectionSchema = Joi.object({
  label: Joi.string().trim().min(1).max(80).required(),
  description: Joi.string().trim().max(200).allow('', null),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0).allow(null),
  displayOrder: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
  image: Joi.any().optional(),
}).unknown(false);

// ---- Shared status/reorder schemas ----
export const statusSchema = Joi.object({
  isActive: Joi.boolean().required().messages({
    'any.required': 'isActive is required',
  }),
});

export const reorderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        id: objectId.required(),
        displayOrder: Joi.number().integer().min(0).required(),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one item must be provided to reorder',
    }),
});

// ---- Site settings (announcement bar + welcome popup) ----
export const announcementBarSchema = Joi.object({
  enabled: Joi.boolean(),
  message: Joi.string().trim().max(200).allow('', null),
  linkText: Joi.string().trim().max(40).allow('', null),
  linkUrl: Joi.string().trim().max(300).allow('', null),
  backgroundColor: Joi.string().trim().max(20).allow('', null),
  textColor: Joi.string().trim().max(20).allow('', null),
  dismissible: Joi.boolean(),
}).unknown(false);

// ---- Commerce / checkout settings ----
export const commerceSettingsSchema = Joi.object({
  freeShippingThreshold: Joi.number().min(0),
  shippingCharge: Joi.number().min(0),
  whatsappCharge: Joi.number().min(0),
  whatsappNumber: Joi.string().trim().max(20).allow('', null),
  checkoutMessage: Joi.string().trim().max(240).allow('', null),
  paymentOptions: Joi.object({
    razorpay: Joi.boolean(),
    whatsapp: Joi.boolean(),
  }),
  returnPolicy: Joi.string().trim().max(4000).allow('', null),
  replacementPolicy: Joi.string().trim().max(4000).allow('', null),
}).unknown(false);

export const welcomePopupSchema = Joi.object({
  enabled: Joi.boolean(),
  title: Joi.string().trim().max(120).allow('', null),
  description: Joi.string().trim().max(400).allow('', null),
  ctaText: Joi.string().trim().max(40).allow('', null),
  ctaLink: Joi.string().trim().max(300).allow('', null),
  delaySeconds: Joi.number().min(0).max(60),
  showOncePerSession: Joi.boolean(),
  image: Joi.any().optional(),
  removeImage: Joi.boolean(),
}).unknown(false);