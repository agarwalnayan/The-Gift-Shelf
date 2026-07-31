import Joi from "joi";

export const createCatalogMasterSchema = Joi.object({
  name: Joi.string().trim().required(),

  slug: Joi.string().trim().lowercase().required(),

  type: Joi.string()
    .valid("tag", "occasion", "recipient")
    .required(),

  description: Joi.string().allow("").default(""),

  displayOrder: Joi.number().default(0),

  isActive: Joi.boolean().default(true),

  showOnHomepage: Joi.boolean().default(false),

  homepageDisplayOrder: Joi.number().default(0),
});

export const updateCatalogMasterSchema = Joi.object({
  name: Joi.string().trim(),

  slug: Joi.string().trim().lowercase(),

  type: Joi.string().valid("tag", "occasion", "recipient"),

  description: Joi.string().allow(""),

  displayOrder: Joi.number(),

  isActive: Joi.boolean(),

  showOnHomepage: Joi.boolean(),

  homepageDisplayOrder: Joi.number(),
}).min(1);