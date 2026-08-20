import Joi from 'joi';

const objectId = Joi.string().trim().hex().length(24);

const orderItemCustomizationSchema = Joi.object({
  key: Joi.string().trim().required(),
  label: Joi.string().trim().required(),
  type: Joi.string().trim().required(),
  value: Joi.any().required(),
  additionalPrice: Joi.number().min(0).default(0),
});

const orderItemSchema = Joi.object({
  product: objectId.required(),
  name: Joi.string().trim().required(),
  image: Joi.string().trim().required(),
  variantSku: Joi.string().trim().allow('', null),
  quantity: Joi.number().integer().min(1).required(),
  price: Joi.number().min(0).required(),
  customizations: Joi.array().items(orderItemCustomizationSchema).default([]),
  customizationPrice: Joi.number().min(0).default(0),
});

export const createOrderRequestSchema = Joi.object({
  source: Joi.string().valid('instagram', 'whatsapp').required(),
  items: Joi.array().items(orderItemSchema).min(1).required(),
  agreedPrice: Joi.number().min(0).required(),
  discount: Joi.number().min(0).default(0),
  internalNotes: Joi.string().trim().max(1000).allow('', null),
}).unknown(false);

export const completeOrderRequestSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string().trim().pattern(/^[6-9]\d{9}$/).required().messages({
    'string.pattern.base': 'Please provide a valid 10-digit phone number',
  }),
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Please provide a valid email address',
  }),
  line1: Joi.string().trim().required(),
  line2: Joi.string().trim().allow('', null),
  city: Joi.string().trim().required(),
  state: Joi.string().trim().required(),
  postalCode: Joi.string().trim().pattern(/^\d{6}$/).required().messages({
    'string.pattern.base': 'Please provide a valid 6-digit postal code',
  }),
  country: Joi.string().trim().default('India'),
  giftMessage: Joi.string().trim().max(300).allow('', null),
  orderNotes: Joi.string().trim().max(300).allow('', null),
  // Optional account creation
  createAccount: Joi.boolean().default(false),
  password: Joi.string().trim().min(8).when('createAccount', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  confirmPassword: Joi.string().trim().valid(Joi.ref('password')).when('createAccount', {
    is: true,
    then: Joi.required().messages({
      'any.only': 'Passwords do not match',
    }),
    otherwise: Joi.optional(),
  }),
  // Updated customizations from customer editing
  updatedCustomizations: Joi.array().items(orderItemCustomizationSchema).default([]),
}).unknown(false);
