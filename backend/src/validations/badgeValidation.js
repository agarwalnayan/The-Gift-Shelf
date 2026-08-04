import Joi from 'joi';

const scalarBadgeFields = {
  name: Joi.string().trim().max(100),
  slug: Joi.string().trim().lowercase().max(100),
  badgeText: Joi.string().trim().max(50),
  description: Joi.string().trim().max(500).allow('', null),
  backgroundColor: Joi.string()
    .trim()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .message('Background color must be a valid hex color')
    .default('#F59E0B'),
  textColor: Joi.string()
    .trim()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .message('Text color must be a valid hex color')
    .default('#FFFFFF'),
  icon: Joi.string().trim().allow('', null),
  priority: Joi.number().min(0).default(0),
  active: Joi.boolean().default(true),
};

export const createBadgeSchema = Joi.object({
  ...scalarBadgeFields,
  name: scalarBadgeFields.name.required().messages({ 'string.empty': 'Badge name is required' }),
  slug: scalarBadgeFields.slug.required().messages({ 'string.empty': 'Badge slug is required' }),
  badgeText: scalarBadgeFields.badgeText.required().messages({ 'string.empty': 'Badge text is required' }),
  backgroundColor: scalarBadgeFields.backgroundColor.required(),
  textColor: scalarBadgeFields.textColor.required(),
}).unknown(false);

export const updateBadgeSchema = Joi.object({ ...scalarBadgeFields }).unknown(false);

export const badgeStatusSchema = Joi.object({
  active: Joi.boolean().required(),
});

export default {
  createBadgeSchema,
  updateBadgeSchema,
  badgeStatusSchema,
};
