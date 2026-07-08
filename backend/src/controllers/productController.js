import mongoose from 'mongoose';
import Joi from 'joi';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { uploadImage, uploadImages, deleteImage } from '../services/cloudinaryService.js';
import { generateSku, generateVariantSku } from '../utils/generateSku.js';
import {
  variantsArraySchema,
  customizationOptionsArraySchema,
  seoSchema,
  weightSchema,
  dimensionsSchema,
} from '../validations/productValidation.js';

const stringArraySchema = Joi.array().items(Joi.string().trim());

const isAdminUser = (req) => Boolean(req.user && ['admin', 'superadmin'].includes(req.user.role));

const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value) && String(new mongoose.Types.ObjectId(value)) === value;

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

const assertUniqueCustomizationKeys = (options) => {
  const keys = options.map((option) => option.key);
  if (new Set(keys).size !== keys.length) {
    throw new ApiError(400, 'Customization option keys must be unique within a product');
  }
};

const resolveVariantSkus = (variants, baseSku) => {
  return variants.map((variant) => ({
    ...variant,
    sku: variant.sku || generateVariantSku(baseSku, variant.attributes),
  }));
};

const buildNestedFieldsFromBody = (body, baseSku) => {
  const nested = {};

  const tags = parseJsonField(body.tags, stringArraySchema, 'Tags');
  const occasion = parseJsonField(body.occasion, stringArraySchema, 'Occasion');
  const recipient = parseJsonField(body.recipient, stringArraySchema, 'Recipient');
  const attributes = parseJsonField(
    body.attributes,
    Joi.array().items(Joi.object({ key: Joi.string().trim(), value: Joi.string().trim() })),
    'Attributes'
  );
  const weight = parseJsonField(body.weight, weightSchema, 'Weight');
  const dimensions = parseJsonField(body.dimensions, dimensionsSchema, 'Dimensions');
  const seo = parseJsonField(body.seo, seoSchema, 'SEO data');
  const variants = parseJsonField(body.variants, variantsArraySchema, 'Variants');
  const customizationOptions = parseJsonField(
    body.customizationOptions,
    customizationOptionsArraySchema,
    'Customization options'
  );

  if (tags !== undefined) nested.tags = tags;
  if (occasion !== undefined) nested.occasion = occasion;
  if (recipient !== undefined) nested.recipient = recipient;
  if (attributes !== undefined) nested.attributes = attributes;
  if (weight !== undefined) nested.weight = weight;
  if (dimensions !== undefined) nested.dimensions = dimensions;
  if (seo !== undefined) nested.seo = seo;
  if (variants !== undefined) nested.variants = resolveVariantSkus(variants, baseSku);
  if (customizationOptions !== undefined) {
    assertUniqueCustomizationKeys(customizationOptions);
    nested.customizationOptions = customizationOptions;
  }

  return nested;
};

const sortOptions = {
  priceAsc: { price: 1 },
  priceDesc: { price: -1 },
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  rating: { ratingsAverage: -1 },
  nameAsc: { name: 1 },
  nameDesc: { name: -1 },
};

export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    brand,
    description,
    shortDescription,
    category,
    subCategory,
    price,
    discountPrice,
    costPrice,
    stock,
    lowStockThreshold,
    material,
    publishStatus,
    isActive,
    isFeatured,
  } = req.body;

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'At least one product image is required');
  }

  const sku = generateSku(name);
  const nested = buildNestedFieldsFromBody(req.body, sku);

  const uploadedImages = await uploadImages(req.files, 'tgs/products');
  const images = uploadedImages.map((image, index) => ({
    ...image,
    order: index,
    isPrimary: index === 0,
  }));

  const product = await Product.create({
    name,
    brand,
    description,
    shortDescription,
    category,
    subCategory: subCategory || null,
    price,
    discountPrice,
    costPrice,
    stock,
    lowStockThreshold,
    material,
    publishStatus,
    isActive: isActive ?? true,
    isFeatured: isFeatured ?? false,
    images,
    sku,
    createdBy: req.user._id,
    updatedBy: req.user._id,
    ...nested,
  });

  res.status(201).json(new ApiResponse(201, { product }, 'Product created successfully'));
});

export const getAllProducts = asyncHandler(async (req, res) => {
  const privileged = isAdminUser(req);
  const {
    category,
    subCategory,
    brand,
    occasion,
    recipient,
    tags,
    search,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 12,
    featured,
    isActive,
    isFeatured,
    publishStatus,
    includeDeleted,
  } = req.query;

  const filter = {};

  if (privileged) {
    filter.isDeleted = includeDeleted === 'true' ? { $in: [true, false] } : { $ne: true };
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    if (publishStatus) filter.publishStatus = publishStatus;
  } else {
    filter.isDeleted = { $ne: true };
    filter.isActive = true;
    filter.publishStatus = 'published';
  }

  if (category) filter.category = category;
  if (subCategory) filter.subCategory = subCategory;
  if (brand) filter.brand = brand;
  if (occasion) filter.occasion = occasion;
  if (recipient) filter.recipient = recipient;
  if (tags) filter.tags = tags;
  if (featured) filter.isFeatured = true;
  if (search) filter.$text = { $search: search };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug')
      .sort(sortOptions[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      },
      'Products fetched successfully'
    )
  );
});

export const getProductByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const privileged = isAdminUser(req);

  const filter = isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };
  if (!privileged) {
    filter.isActive = true;
    filter.isDeleted = { $ne: true };
    filter.publishStatus = 'published';
  }

  const product = await Product.findOne(filter)
    .populate('category', 'name slug')
    .populate('subCategory', 'name slug')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!product) throw new ApiError(404, 'Product not found');

  res.status(200).json(new ApiResponse(200, { product }, 'Product fetched successfully'));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!product) throw new ApiError(404, 'Product not found');

  const fields = [
    'name',
    'brand',
    'description',
    'shortDescription',
    'category',
    'price',
    'discountPrice',
    'costPrice',
    'stock',
    'lowStockThreshold',
    'material',
    'publishStatus',
    'isActive',
    'isFeatured',
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  if (req.body.subCategory !== undefined) {
    product.subCategory = req.body.subCategory || null;
  }

  const nested = buildNestedFieldsFromBody(req.body, product.sku);
  Object.assign(product, nested);

  if (req.files && req.files.length > 0) {
    const uploadedImages = await uploadImages(req.files, 'tgs/products');
    const startOrder = product.images.length;
    const hasPrimary = product.images.some((image) => image.isPrimary);

    uploadedImages.forEach((image, index) => {
      product.images.push({
        ...image,
        order: startOrder + index,
        isPrimary: !hasPrimary && index === 0,
      });
    });
  }

  product.updatedBy = req.user._id;

  await product.save();

  res.status(200).json(new ApiResponse(200, { product }, 'Product updated successfully'));
});

/**
 * Manages the product's image gallery in one call: reorders existing images,
 * updates which one is primary, removes any existing image omitted from the
 * `images` payload, and appends newly uploaded files (if any).
 */
export const updateProductImages = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!product) throw new ApiError(404, 'Product not found');

  if (req.body.imagesMeta) {
    let keepList;
    try {
      keepList = JSON.parse(req.body.imagesMeta);
    } catch (error) {
      throw new ApiError(400, 'imagesMeta must be valid JSON');
    }

    const keepMap = new Map(keepList.map((item) => [item.publicId, item]));

    const toRemove = product.images.filter((image) => !keepMap.has(image.publicId));
    await Promise.all(toRemove.map((image) => deleteImage(image.publicId)));

    const retained = product.images
      .filter((image) => keepMap.has(image.publicId))
      .map((image) => ({
        ...image.toObject(),
        order: keepMap.get(image.publicId).order ?? image.order,
        isPrimary: Boolean(keepMap.get(image.publicId).isPrimary),
      }));

    product.images = retained;
  }

  if (req.files && req.files.length > 0) {
    const uploadedImages = await uploadImages(req.files, 'tgs/products');
    const startOrder = product.images.length;
    const hasPrimary = product.images.some((image) => image.isPrimary);

    uploadedImages.forEach((image, index) => {
      product.images.push({
        ...image,
        order: startOrder + index,
        isPrimary: !hasPrimary && index === 0,
      });
    });
  }

  if (product.images.length === 0) {
    throw new ApiError(400, 'At least one product image is required');
  }

  if (!product.images.some((image) => image.isPrimary)) {
    product.images[0].isPrimary = true;
  }

  product.updatedBy = req.user._id;
  await product.save();

  res.status(200).json(new ApiResponse(200, { product }, 'Product images updated successfully'));
});

export const updateProductStatus = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!product) throw new ApiError(404, 'Product not found');

  product.isActive = req.body.isActive;
  product.updatedBy = req.user._id;
  await product.save();

  res.status(200).json(new ApiResponse(200, { product }, 'Product status updated successfully'));
});

export const updateProductPublishStatus = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!product) throw new ApiError(404, 'Product not found');

  product.publishStatus = req.body.publishStatus;
  product.updatedBy = req.user._id;
  await product.save();

  res.status(200).json(new ApiResponse(200, { product }, 'Product publish status updated successfully'));
});

export const updateProductFeature = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!product) throw new ApiError(404, 'Product not found');

  product.isFeatured = req.body.isFeatured;
  product.updatedBy = req.user._id;
  await product.save();

  res.status(200).json(new ApiResponse(200, { product }, 'Product feature setting updated successfully'));
});

export const bulkProductAction = asyncHandler(async (req, res) => {
  const { ids, action } = req.body;

  const actionMap = {
    activate: { isActive: true },
    deactivate: { isActive: false },
    publish: { publishStatus: 'published' },
    draft: { publishStatus: 'draft' },
    feature: { isFeatured: true },
    unfeature: { isFeatured: false },
  };

  if (action === 'delete') {
    await Product.updateMany(
      { _id: { $in: ids } },
      { $set: { isDeleted: true, isActive: false, deletedAt: new Date(), updatedBy: req.user._id } }
    );
    return res.status(200).json(new ApiResponse(200, null, `${ids.length} product(s) moved to trash`));
  }

  const update = actionMap[action];
  if (!update) throw new ApiError(400, 'Unsupported bulk action');

  const result = await Product.updateMany(
    { _id: { $in: ids }, isDeleted: { $ne: true } },
    { $set: { ...update, updatedBy: req.user._id } }
  );

  res
    .status(200)
    .json(new ApiResponse(200, { matched: result.matchedCount, modified: result.modifiedCount }, 'Bulk action applied successfully'));
});

export const softDeleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!product) throw new ApiError(404, 'Product not found');

  product.isDeleted = true;
  product.isActive = false;
  product.deletedAt = new Date();
  product.updatedBy = req.user._id;
  await product.save();

  res.status(200).json(new ApiResponse(200, null, 'Product moved to trash successfully'));
});

export const restoreProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: true });
  if (!product) throw new ApiError(404, 'Deleted product not found');

  product.isDeleted = false;
  product.deletedAt = null;
  product.updatedBy = req.user._id;
  await product.save();

  res.status(200).json(new ApiResponse(200, { product }, 'Product restored successfully'));
});

export const permanentlyDeleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  const imagesToRemove = [
    ...product.images,
    ...product.variants.flatMap((variant) => variant.images || []),
  ];
  await Promise.all(imagesToRemove.map((image) => deleteImage(image.publicId)));
  await product.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Product permanently deleted'));
});

/**
 * Lets a logged-in customer upload an image for an `image_upload` /
 * `multi_image_upload` customization option ahead of adding the product to
 * their cart. Returns a Cloudinary URL to include in the cart payload.
 */
export const uploadCustomizationImage = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: { $ne: true }, isActive: true });
  if (!product) throw new ApiError(404, 'Product not found');

  if (!req.file) throw new ApiError(400, 'An image file is required');

  const image = await uploadImage(req.file.buffer, 'tgs/customizations');

  res.status(201).json(new ApiResponse(201, { url: image.url, publicId: image.publicId }, 'Image uploaded successfully'));
});
