import Joi from 'joi';
import { CUSTOMIZATION_TYPE_VALUES } from '../utils/customizationTypes.js';

const objectId = Joi.string().trim().hex().length(24);

const scalarProductFields = {
  name: Joi.string().trim().min(2).max(150),
  brand: Joi.string().trim().max(100).allow('', null),
  description: Joi.string().trim(),
  shortDescription: Joi.string().trim().max(250).allow('', null),
  category: objectId,
  subCategory: objectId.allow('', null),
  price: Joi.number().min(0),
  discountPrice: Joi.number().min(0),
  costPrice: Joi.number().min(0),
  stock: Joi.number().integer().min(0),
  lowStockThreshold: Joi.number().integer().min(0),
  material: Joi.string().trim().allow('', null),
  publishStatus: Joi.string().valid('draft', 'published'),
  isActive: Joi.boolean(),
  isFeatured: Joi.boolean(),
  tags: Joi.string().allow('', null),
  occasion: Joi.string().allow('', null),
  recipient: Joi.string().allow('', null),
  attributes: Joi.string().allow('', null),
  weight: Joi.string().allow('', null),
  dimensions: Joi.string().allow('', null),
  variants: Joi.string().allow('', null),
  customizationOptions: Joi.string().allow('', null),
  seo: Joi.string().allow('', null),
};

export const createProductSchema = Joi.object({
  ...scalarProductFields,
  name: scalarProductFields.name.required().messages({ 'string.empty': 'Product name is required' }),
  description: scalarProductFields.description.required().messages({ 'string.empty': 'Product description is required' }),
  category: scalarProductFields.category.required().messages({
    'any.required': 'Category is required',
    'string.hex': 'Category must be a valid category id',
    'string.length': 'Category must be a valid category id',
  }),
  price: scalarProductFields.price.required().messages({ 'any.required': 'Base price is required' }),
  stock: scalarProductFields.stock.required().messages({ 'any.required': 'Stock quantity is required' }),
}).unknown(false);

export const updateProductSchema = Joi.object({ ...scalarProductFields }).unknown(false);

export const productStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
});

export const productPublishSchema = Joi.object({
  publishStatus: Joi.string().valid('draft', 'published').required(),
});

export const productFeatureSchema = Joi.object({
  isFeatured: Joi.boolean().required(),
});

export const bulkActionSchema = Joi.object({
  ids: Joi.array().items(objectId.required()).min(1).required(),
  action: Joi.string().valid('activate', 'deactivate', 'publish', 'draft', 'feature', 'unfeature', 'delete').required(),
});

export const weightSchema = Joi.object({
  value: Joi.number().min(0),
  unit: Joi.string().valid('g', 'kg'),
});

export const dimensionsSchema = Joi.object({
  length: Joi.number().min(0),
  width: Joi.number().min(0),
  height: Joi.number().min(0),
  unit: Joi.string().valid('cm', 'in'),
});

export const seoSchema = Joi.object({
  metaTitle: Joi.string().trim().max(70).allow('', null),
  metaDescription: Joi.string().trim().max(160).allow('', null),
  keywords: Joi.array().items(Joi.string().trim().max(50)).max(20),
});

const variantAttributeSchema = Joi.object({
  name: Joi.string().trim().required(),
  value: Joi.string().trim().required(),
});

export const variantSchema = Joi.object({
  sku: Joi.string().trim().allow('', null),
  attributes: Joi.array().items(variantAttributeSchema).min(1).required(),
  price: Joi.number().min(0).allow(null),
  stock: Joi.number().integer().min(0).default(0),
  isActive: Joi.boolean().default(true),
});

export const variantsArraySchema = Joi.array().items(variantSchema);

const customizationValidationRulesSchema = Joi.object({
  minLength: Joi.number().integer().min(0),
  maxLength: Joi.number().integer().min(0),
  minSelections: Joi.number().integer().min(0),
  maxSelections: Joi.number().integer().min(0),
  allowedFileTypes: Joi.array().items(Joi.string().trim()),
  maxFileSizeMB: Joi.number().min(0),
  minDate: Joi.date(),
  maxDate: Joi.date(),
  pattern: Joi.string().trim(),
});

export const customizationOptionSchema = Joi.object({
  key: Joi.string().trim().lowercase().pattern(/^[a-z0-9_-]+$/).required().messages({
    'string.pattern.base': 'Customization key may only contain lowercase letters, numbers, hyphens and underscores',
  }),
  label: Joi.string().trim().max(100).required(),
  type: Joi.string()
    .valid(...CUSTOMIZATION_TYPE_VALUES)
    .required()
    .messages({ 'any.only': 'Unsupported customization type' }),
  isEnabled: Joi.boolean().default(true),
  isRequired: Joi.boolean().default(false),
  additionalPrice: Joi.number().min(0).default(0),
  choices: Joi.array().items(Joi.string().trim()).default([]),
  placeholder: Joi.string().trim().allow('', null),
  helpText: Joi.string().trim().allow('', null),
  displayOrder: Joi.number().integer().min(0).default(0),
  validation: customizationValidationRulesSchema.default({}),
});

export const customizationOptionsArraySchema = Joi.array().items(customizationOptionSchema);
