import Joi from 'joi';

const objectId = Joi.string().trim().hex().length(24);

// Tier validation for Buy More Save More
const tierSchema = Joi.object({
  minQuantity: Joi.number().integer().min(1).required(),
  discountType: Joi.string().valid('flat', 'percentage', 'fixed_price').required(),
  discountValue: Joi.number().min(0).required(),
});

// Target configuration validation
const targetConfigSchema = Joi.object({
  scope: Joi.string().valid('entire_cart', 'categories', 'collections', 'products').required(),
  categoryIds: Joi.array().items(objectId).default([]),
  productIds: Joi.array().items(objectId).default([]),
  collectionTags: Joi.array().items(Joi.string().trim()).default([]),
});

// Eligibility configuration validation
const eligibilityConfigSchema = Joi.object({
  userTypes: Joi.array().items(
    Joi.string().valid('everyone', 'guests', 'logged_in', 'new_customers', 'returning_customers')
  ).default(['everyone']),
  minOrderValue: Joi.number().min(0).default(0),
  maxOrderValue: Joi.number().min(0).allow(null).default(null),
});

// Buy More Save More configuration validation
const buyMoreSaveMoreConfigSchema = Joi.object({
  pricingMethod: Joi.string().valid('fixed_bundle_price', 'flat_discount', 'percentage_discount', 'tier_pricing').required(),
  quantityRule: Joi.string().valid('mixed_products', 'same_product_only').default('mixed_products'),
  tiers: Joi.array().items(tierSchema).default([]),
});

// Discount configuration validation
const discountConfigSchema = Joi.object({
  discountType: Joi.string().valid('flat', 'percentage').required(),
  discountValue: Joi.number().min(0).required(),
  maxDiscount: Joi.number().min(0).allow(null).default(null),
});

// Buy X Get Y configuration validation
const buyXGetYConfigSchema = Joi.object({
  buyQuantity: Joi.number().integer().min(1).required(),
  getQuantity: Joi.number().integer().min(1).required(),
  getProductsFree: Joi.boolean().default(true),
  getProductIds: Joi.array().items(objectId).default([]),
  getCategoryIds: Joi.array().items(objectId).default([]),
});

// Free shipping configuration validation
const freeShippingConfigSchema = Joi.object({
  minOrderValue: Joi.number().min(0).required(),
});

// Free gift configuration validation
const freeGiftConfigSchema = Joi.object({
  giftProductId: objectId.required(),
  minOrderValue: Joi.number().min(0).default(0),
  maxGiftsPerOrder: Joi.number().integer().min(1).default(1),
});

// Bundle pricing configuration validation
const bundlePricingConfigSchema = Joi.object({
  bundleProducts: Joi.array().items(
    Joi.object({
      productId: objectId.required(),
      quantity: Joi.number().integer().min(1).required(),
    })
  ).min(1).required(),
  bundlePrice: Joi.number().min(0).required(),
});

// Category/Collection discount configuration validation
const categoryDiscountConfigSchema = Joi.object({
  discountType: Joi.string().valid('flat', 'percentage').required(),
  discountValue: Joi.number().min(0).required(),
  maxDiscount: Joi.number().min(0).allow(null).default(null),
});

// First order configuration validation
const firstOrderConfigSchema = Joi.object({
  discountType: Joi.string().valid('flat', 'percentage').required(),
  discountValue: Joi.number().min(0).required(),
  maxDiscount: Joi.number().min(0).allow(null).default(null),
});

// Festival configuration validation
const festivalConfigSchema = Joi.object({
  festivalName: Joi.string().trim().min(1).max(100).required(),
  discountType: Joi.string().valid('flat', 'percentage').required(),
  discountValue: Joi.number().min(0).required(),
  maxDiscount: Joi.number().min(0).allow(null).default(null),
});

// Custom rule configuration validation
const customRuleConfigSchema = Joi.object({
  ruleName: Joi.string().trim().min(1).max(100).required(),
  config: Joi.object().default({}),
});

// Main promotion creation schema
export const createPromotionSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().max(500).allow('', null).default(''),
  type: Joi.string().valid(
    'buy_more_save_more',
    'flat_discount',
    'percentage_discount',
    'buy_x_get_y',
    'free_shipping',
    'free_gift',
    'bundle_pricing',
    'category_discount',
    'collection_discount',
    'first_order_offer',
    'festival_offer',
    'custom_rule'
  ).required(),
  status: Joi.string().valid('draft', 'scheduled', 'active', 'expired', 'archived').default('draft'),
  target: targetConfigSchema.default({ scope: 'entire_cart' }),
  eligibility: eligibilityConfigSchema.default({ userTypes: ['everyone'], minOrderValue: 0 }),
  buyMoreSaveMoreConfig: buyMoreSaveMoreConfigSchema.allow(null).default(null),
  discountConfig: discountConfigSchema.allow(null).default(null),
  buyXGetYConfig: buyXGetYConfigSchema.allow(null).default(null),
  freeShippingConfig: freeShippingConfigSchema.allow(null).default(null),
  freeGiftConfig: freeGiftConfigSchema.allow(null).default(null),
  bundlePricingConfig: bundlePricingConfigSchema.allow(null).default(null),
  categoryDiscountConfig: categoryDiscountConfigSchema.allow(null).default(null),
  firstOrderConfig: firstOrderConfigSchema.allow(null).default(null),
  festivalConfig: festivalConfigSchema.allow(null).default(null),
  customRuleConfig: customRuleConfigSchema.allow(null).default(null),
  startDate: Joi.date().allow(null).default(null),
  endDate: Joi.date().allow(null).default(null),
  bannerImage: Joi.any().optional(),
  badgeText: Joi.string().trim().max(50).allow('', null).default(''),
  showOnProductPage: Joi.boolean().default(true),
  showInCart: Joi.boolean().default(true),
  priority: Joi.number().integer().default(0),
  maxUses: Joi.number().integer().min(0).allow(null).default(null),
  maxUsesPerUser: Joi.number().integer().min(0).allow(null).default(null),
}).unknown(false);

// Update promotion schema (all fields optional)
export const updatePromotionSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200),
  description: Joi.string().trim().max(500).allow('', null),
  type: Joi.string().valid(
    'buy_more_save_more',
    'flat_discount',
    'percentage_discount',
    'buy_x_get_y',
    'free_shipping',
    'free_gift',
    'bundle_pricing',
    'category_discount',
    'collection_discount',
    'first_order_offer',
    'festival_offer',
    'custom_rule'
  ),
  status: Joi.string().valid('draft', 'scheduled', 'active', 'expired', 'archived'),
  target: targetConfigSchema,
  eligibility: eligibilityConfigSchema,
  buyMoreSaveMoreConfig: buyMoreSaveMoreConfigSchema.allow(null),
  discountConfig: discountConfigSchema.allow(null),
  buyXGetYConfig: buyXGetYConfigSchema.allow(null),
  freeShippingConfig: freeShippingConfigSchema.allow(null),
  freeGiftConfig: freeGiftConfigSchema.allow(null),
  bundlePricingConfig: bundlePricingConfigSchema.allow(null),
  categoryDiscountConfig: categoryDiscountConfigSchema.allow(null),
  firstOrderConfig: firstOrderConfigSchema.allow(null),
  festivalConfig: festivalConfigSchema.allow(null),
  customRuleConfig: customRuleConfigSchema.allow(null),
  startDate: Joi.date().allow(null),
  endDate: Joi.date().allow(null),
  bannerImage: Joi.any().optional(),
  removeBannerImage: Joi.boolean(),
  badgeText: Joi.string().trim().max(50).allow('', null),
  showOnProductPage: Joi.boolean(),
  showInCart: Joi.boolean(),
  priority: Joi.number().integer(),
  maxUses: Joi.number().integer().min(0).allow(null),
  maxUsesPerUser: Joi.number().integer().min(0).allow(null),
}).unknown(false);

// Status update schema
export const promotionStatusSchema = Joi.object({
  status: Joi.string().valid('draft', 'scheduled', 'active', 'expired', 'archived').required(),
}).unknown(false);

// Promotion evaluation request schema
export const evaluatePromotionsSchema = Joi.object({
  cartItems: Joi.array().items(
    Joi.object({
      productId: objectId.required(),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().min(0).required(),
      categoryId: objectId.allow(null),
      variantSku: Joi.string().allow(null),
    })
  ).required(),
  subtotal: Joi.number().min(0).required(),
  userId: objectId.allow(null),
  isNewCustomer: Joi.boolean().default(false),
}).unknown(false);
