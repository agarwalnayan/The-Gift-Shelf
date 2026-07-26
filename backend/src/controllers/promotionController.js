import mongoose from 'mongoose';
import Joi from 'joi';
import Promotion from '../models/Promotion.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { uploadImage, deleteImage } from '../services/cloudinaryService.js';
import PromotionService from '../services/promotionService.js';
import {
  createPromotionSchema,
  updatePromotionSchema,
  promotionStatusSchema,
  evaluatePromotionsSchema,
} from '../validations/promotionValidation.js';

const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value) && String(new mongoose.Types.ObjectId(value)) === value;

const isAdminUser = (req) => Boolean(req.user && ['admin', 'superadmin'].includes(req.user.role));

// Helper to parse JSON fields
const parseJsonField = (raw, schema, label) => {
  if (raw === undefined) return undefined;
  if (raw === '' || raw === null) return schema.type === 'array' ? [] : undefined;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new ApiError(400, `${label} must be valid JSON`);
  }

  const { error, value } = schema.validate(parsed, { abortEarly: false });
  if (error) {
    throw new ApiError(400, `Invalid ${label}`, error.details.map((detail) => detail.message));
  }

  return value;
};

export const createPromotion = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    type,
    status,
    target,
    eligibility,
    buyMoreSaveMoreConfig,
    discountConfig,
    buyXGetYConfig,
    freeShippingConfig,
    freeGiftConfig,
    bundlePricingConfig,
    categoryDiscountConfig,
    firstOrderConfig,
    festivalConfig,
    customRuleConfig,
    startDate,
    endDate,
    badgeText,
    showOnProductPage,
    showInCart,
    priority,
    maxUses,
    maxUsesPerUser,
  } = req.body;

  // Parse nested JSON fields
  const parsedTarget = parseJsonField(req.body.target, createPromotionSchema.extract('target'), 'Target configuration');
  const parsedEligibility = parseJsonField(req.body.eligibility, createPromotionSchema.extract('eligibility'), 'Eligibility configuration');
  const parsedBuyMoreSaveMore = parseJsonField(req.body.buyMoreSaveMoreConfig, createPromotionSchema.extract('buyMoreSaveMoreConfig'), 'Buy More Save More configuration');
  const parsedDiscount = parseJsonField(req.body.discountConfig, createPromotionSchema.extract('discountConfig'), 'Discount configuration');
  const parsedBuyXGetY = parseJsonField(req.body.buyXGetYConfig, createPromotionSchema.extract('buyXGetYConfig'), 'Buy X Get Y configuration');
  const parsedFreeShipping = parseJsonField(req.body.freeShippingConfig, createPromotionSchema.extract('freeShippingConfig'), 'Free shipping configuration');
  const parsedFreeGift = parseJsonField(req.body.freeGiftConfig, createPromotionSchema.extract('freeGiftConfig'), 'Free gift configuration');
  const parsedBundlePricing = parseJsonField(req.body.bundlePricingConfig, createPromotionSchema.extract('bundlePricingConfig'), 'Bundle pricing configuration');
  const parsedCategoryDiscount = parseJsonField(req.body.categoryDiscountConfig, createPromotionSchema.extract('categoryDiscountConfig'), 'Category discount configuration');
  const parsedFirstOrder = parseJsonField(req.body.firstOrderConfig, createPromotionSchema.extract('firstOrderConfig'), 'First order configuration');
  const parsedFestival = parseJsonField(req.body.festivalConfig, createPromotionSchema.extract('festivalConfig'), 'Festival configuration');
  const parsedCustomRule = parseJsonField(req.body.customRuleConfig, createPromotionSchema.extract('customRuleConfig'), 'Custom rule configuration');

  // Handle banner image upload
  let bannerImage = { url: '', publicId: '' };
  if (req.file) {
    const uploaded = await uploadImage(req.file, 'tgs/promotions');
    bannerImage = { url: uploaded.url, publicId: uploaded.publicId };
  }

  const promotion = await Promotion.create({
    name,
    description: description || '',
    type,
    status: status || 'draft',
    target: parsedTarget || { scope: 'entire_cart' },
    eligibility: parsedEligibility || { userTypes: ['everyone'], minOrderValue: 0 },
    buyMoreSaveMoreConfig: parsedBuyMoreSaveMore || null,
    discountConfig: parsedDiscount || null,
    buyXGetYConfig: parsedBuyXGetY || null,
    freeShippingConfig: parsedFreeShipping || null,
    freeGiftConfig: parsedFreeGift || null,
    bundlePricingConfig: parsedBundlePricing || null,
    categoryDiscountConfig: parsedCategoryDiscount || null,
    firstOrderConfig: parsedFirstOrder || null,
    festivalConfig: parsedFestival || null,
    customRuleConfig: parsedCustomRule || null,
    startDate: startDate || null,
    endDate: endDate || null,
    bannerImage,
    badgeText: badgeText || '',
    showOnProductPage: showOnProductPage ?? true,
    showInCart: showInCart ?? true,
    priority: priority ?? 0,
    maxUses: maxUses || null,
    maxUsesPerUser: maxUsesPerUser || null,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, { promotion }, 'Promotion created successfully'));
});

export const getPromotions = asyncHandler(async (req, res) => {
  const privileged = isAdminUser(req);
  const {
    type,
    status,
    search,
    page = 1,
    limit = 20,
  } = req.query;

  const filter = {};

  if (privileged) {
    filter.isDeleted = { $ne: true };
  } else {
    filter.isDeleted = { $ne: true };
    filter.status = 'active';
  }

  if (type) filter.type = type;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [promotions, total] = await Promise.all([
    Promotion.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('target.categoryIds', 'name slug')
      .populate('target.productIds', 'name slug'),
    Promotion.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        promotions,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      },
      'Promotions fetched successfully'
    )
  );
});

export const getPromotionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const privileged = isAdminUser(req);

  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid promotion ID');
  }

  const filter = { _id: id, isDeleted: { $ne: true } };
  if (!privileged) {
    filter.status = 'active';
  }

  const promotion = await Promotion.findOne(filter)
    .populate('target.categoryIds', 'name slug')
    .populate('target.productIds', 'name slug')
    .populate('freeGiftConfig.giftProductId', 'name slug')
    .populate('bundlePricingConfig.bundleProducts.productId', 'name slug');

  if (!promotion) {
    throw new ApiError(404, 'Promotion not found');
  }

  res.status(200).json(new ApiResponse(200, { promotion }, 'Promotion fetched successfully'));
});

export const updatePromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!promotion) throw new ApiError(404, 'Promotion not found');

  const fields = [
    'name',
    'description',
    'type',
    'status',
    'startDate',
    'endDate',
    'badgeText',
    'showOnProductPage',
    'showInCart',
    'priority',
    'maxUses',
    'maxUsesPerUser',
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) promotion[field] = req.body[field];
  });

  // Parse nested JSON fields
  if (req.body.target !== undefined) {
    promotion.target = parseJsonField(req.body.target, updatePromotionSchema.extract('target'), 'Target configuration');
  }
  if (req.body.eligibility !== undefined) {
    promotion.eligibility = parseJsonField(req.body.eligibility, updatePromotionSchema.extract('eligibility'), 'Eligibility configuration');
  }
  if (req.body.buyMoreSaveMoreConfig !== undefined) {
    promotion.buyMoreSaveMoreConfig = parseJsonField(req.body.buyMoreSaveMoreConfig, updatePromotionSchema.extract('buyMoreSaveMoreConfig'), 'Buy More Save More configuration');
  }
  if (req.body.discountConfig !== undefined) {
    promotion.discountConfig = parseJsonField(req.body.discountConfig, updatePromotionSchema.extract('discountConfig'), 'Discount configuration');
  }
  if (req.body.buyXGetYConfig !== undefined) {
    promotion.buyXGetYConfig = parseJsonField(req.body.buyXGetYConfig, updatePromotionSchema.extract('buyXGetYConfig'), 'Buy X Get Y configuration');
  }
  if (req.body.freeShippingConfig !== undefined) {
    promotion.freeShippingConfig = parseJsonField(req.body.freeShippingConfig, updatePromotionSchema.extract('freeShippingConfig'), 'Free shipping configuration');
  }
  if (req.body.freeGiftConfig !== undefined) {
    promotion.freeGiftConfig = parseJsonField(req.body.freeGiftConfig, updatePromotionSchema.extract('freeGiftConfig'), 'Free gift configuration');
  }
  if (req.body.bundlePricingConfig !== undefined) {
    promotion.bundlePricingConfig = parseJsonField(req.body.bundlePricingConfig, updatePromotionSchema.extract('bundlePricingConfig'), 'Bundle pricing configuration');
  }
  if (req.body.categoryDiscountConfig !== undefined) {
    promotion.categoryDiscountConfig = parseJsonField(req.body.categoryDiscountConfig, updatePromotionSchema.extract('categoryDiscountConfig'), 'Category discount configuration');
  }
  if (req.body.firstOrderConfig !== undefined) {
    promotion.firstOrderConfig = parseJsonField(req.body.firstOrderConfig, updatePromotionSchema.extract('firstOrderConfig'), 'First order configuration');
  }
  if (req.body.festivalConfig !== undefined) {
    promotion.festivalConfig = parseJsonField(req.body.festivalConfig, updatePromotionSchema.extract('festivalConfig'), 'Festival configuration');
  }
  if (req.body.customRuleConfig !== undefined) {
    promotion.customRuleConfig = parseJsonField(req.body.customRuleConfig, updatePromotionSchema.extract('customRuleConfig'), 'Custom rule configuration');
  }

  // Handle banner image
  if (req.file) {
    if (promotion.bannerImage?.publicId) {
      await deleteImage(promotion.bannerImage.publicId);
    }
    const uploaded = await uploadImage(req.file, 'tgs/promotions');
    promotion.bannerImage = { url: uploaded.url, publicId: uploaded.publicId };
  }

  if (req.body.removeBannerImage && promotion.bannerImage?.publicId) {
    await deleteImage(promotion.bannerImage.publicId);
    promotion.bannerImage = { url: '', publicId: '' };
  }

  promotion.updatedBy = req.user._id;
  await promotion.save();

  res.status(200).json(new ApiResponse(200, { promotion }, 'Promotion updated successfully'));
});

export const updatePromotionStatus = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!promotion) throw new ApiError(404, 'Promotion not found');

  promotion.status = req.body.status;
  promotion.updatedBy = req.user._id;
  await promotion.save();

  res.status(200).json(new ApiResponse(200, { promotion }, 'Promotion status updated successfully'));
});

export const deletePromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!promotion) throw new ApiError(404, 'Promotion not found');

  if (promotion.bannerImage?.publicId) {
    await deleteImage(promotion.bannerImage.publicId);
  }

  promotion.isDeleted = true;
  promotion.deletedAt = new Date();
  promotion.updatedBy = req.user._id;
  await promotion.save();

  res.status(200).json(new ApiResponse(200, null, 'Promotion deleted successfully'));
});

export const evaluatePromotions = asyncHandler(async (req, res) => {
  const { cartItems, subtotal, userId, isNewCustomer } = req.body;

  const evaluatedPromotions = await PromotionService.evaluatePromotions(
    cartItems,
    subtotal,
    userId,
    isNewCustomer
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        applicablePromotions: evaluatedPromotions,
        total: evaluatedPromotions.length,
      },
      'Promotions evaluated successfully'
    )
  );
});
