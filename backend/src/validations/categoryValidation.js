import Joi from 'joi';

const objectId = Joi.string().trim().hex().length(24);

export const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required().messages({
    'string.empty': 'Category name is required',
    'string.min': 'Category name must be at least 2 characters',
    'string.max': 'Category name cannot exceed 150 characters',
  }),
  description: Joi.string().trim().max(2000).allow('', null),
  shortDescription: Joi.string().trim().max(300).allow('', null),
  parentCategory: objectId.allow('', null).messages({
    'string.hex': 'Parent category must be a valid category id',
    'string.length': 'Parent category must be a valid category id',
  }),
  displayOrder: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
  isFeatured: Joi.boolean(),
  showOnHomepage: Joi.boolean(),
  seo: Joi.string().allow('', null),
}).unknown(false);

export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).messages({
    'string.min': 'Category name must be at least 2 characters',
    'string.max': 'Category name cannot exceed 150 characters',
  }),
  description: Joi.string().trim().max(2000).allow('', null),
  shortDescription: Joi.string().trim().max(300).allow('', null),
  parentCategory: objectId.allow('', null).messages({
    'string.hex': 'Parent category must be a valid category id',
    'string.length': 'Parent category must be a valid category id',
  }),
  displayOrder: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
  isFeatured: Joi.boolean(),
  showOnHomepage: Joi.boolean(),
  seo: Joi.string().allow('', null),
}).unknown(false);

export const statusSchema = Joi.object({
  isActive: Joi.boolean().required().messages({
    'any.required': 'isActive is required',
  }),
});

export const featureSchema = Joi.object({
  isFeatured: Joi.boolean(),
  showOnHomepage: Joi.boolean(),
})
  .or('isFeatured', 'showOnHomepage')
  .messages({
    'object.missing': 'Provide isFeatured and/or showOnHomepage',
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
      'array.min': 'At least one category must be provided to reorder',
    }),
});

export const seoSchema = Joi.object({
  metaTitle: Joi.string().trim().max(70).allow('', null),
  metaDescription: Joi.string().trim().max(160).allow('', null),
  keywords: Joi.array().items(Joi.string().trim().max(50)).max(20),
});
