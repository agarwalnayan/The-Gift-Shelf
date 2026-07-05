import mongoose from 'mongoose';
import Category from '../models/Category.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { uploadImage, deleteImage } from '../services/cloudinaryService.js';
import { seoSchema } from '../validations/categoryValidation.js';

const isAdminUser = (req) => Boolean(req.user && ['admin', 'superadmin'].includes(req.user.role));

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value) && String(new mongoose.Types.ObjectId(value)) === value;

const parseSeo = (rawSeo) => {
  if (rawSeo === undefined) return undefined;
  if (!rawSeo) return { metaTitle: '', metaDescription: '', keywords: [] };

  let parsed;
  try {
    parsed = JSON.parse(rawSeo);
  } catch (error) {
    throw new ApiError(400, 'SEO data must be valid JSON');
  }

  const { error, value } = seoSchema.validate(parsed, { abortEarly: false });
  if (error) {
    throw new ApiError(400, 'Invalid SEO data', error.details.map((detail) => detail.message));
  }

  return value;
};

const sortMap = {
  displayOrder: { displayOrder: 1 },
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  nameAsc: { name: 1 },
  nameDesc: { name: -1 },
};

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, shortDescription, parentCategory, displayOrder, isActive, isFeatured, showOnHomepage, seo } =
    req.body;

  if (parentCategory) {
    if (!isValidObjectId(parentCategory)) throw new ApiError(400, 'Invalid parent category id');
    const parentExists = await Category.findOne({ _id: parentCategory, isDeleted: { $ne: true } });
    if (!parentExists) throw new ApiError(404, 'Parent category not found');
  }

  let image = { url: '', publicId: '' };
  let banner = { url: '', publicId: '' };

  if (req.files?.image?.[0]) {
    image = await uploadImage(req.files.image[0].buffer, 'tgs/categories');
  }
  if (req.files?.banner?.[0]) {
    banner = await uploadImage(req.files.banner[0].buffer, 'tgs/categories/banners');
  }

  const parentDoc = parentCategory ? await Category.findById(parentCategory).select('level') : null;

  const category = await Category.create({
    name,
    description,
    shortDescription,
    parentCategory: parentCategory || null,
    level: parentDoc ? parentDoc.level + 1 : 0,
    displayOrder: displayOrder ?? 0,
    isActive: isActive ?? true,
    isFeatured: isFeatured ?? false,
    showOnHomepage: showOnHomepage ?? false,
    seo: parseSeo(seo) ?? {},
    image,
    banner,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, { category }, 'Category created successfully'));
});

export const getAllCategories = asyncHandler(async (req, res) => {
  const privileged = isAdminUser(req);
  const {
    search,
    isActive,
    isFeatured,
    showOnHomepage,
    parentCategory,
    level,
    includeDeleted,
    page,
    limit,
    sort,
  } = req.query;

  const filter = {};

  if (privileged) {
    filter.isDeleted = includeDeleted === 'true' ? { $in: [true, false] } : { $ne: true };
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    if (showOnHomepage !== undefined) filter.showOnHomepage = showOnHomepage === 'true';
  } else {
    filter.isDeleted = { $ne: true };
    filter.isActive = true;
  }

  if (parentCategory !== undefined) {
    filter.parentCategory = parentCategory === 'null' || parentCategory === '' ? null : parentCategory;
  }

  if (level !== undefined && !Number.isNaN(Number(level))) {
    filter.level = Number(level);
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const sortBy = sortMap[sort] || sortMap.displayOrder;
  const shouldPaginate = privileged && (page !== undefined || limit !== undefined);

  const baseQuery = Category.find(filter).populate('parentCategory', 'name slug').sort(sortBy);

  if (!shouldPaginate) {
    const categories = await baseQuery;
    return res
      .status(200)
      .json(new ApiResponse(200, { categories, count: categories.length }, 'Categories fetched successfully'));
  }

  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.max(Number(limit) || 20, 1);
  const skip = (pageNum - 1) * limitNum;

  const [categories, total] = await Promise.all([
    baseQuery.skip(skip).limit(limitNum),
    Category.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      { categories, total, page: pageNum, totalPages: Math.ceil(total / limitNum) },
      'Categories fetched successfully'
    )
  );
});

export const getCategoryTree = asyncHandler(async (req, res) => {
  const privileged = isAdminUser(req);

  const filter = { isDeleted: { $ne: true } };
  if (!privileged) filter.isActive = true;

  const categories = await Category.find(filter).sort({ displayOrder: 1 }).lean();

  const nodeMap = new Map();
  categories.forEach((category) => {
    nodeMap.set(String(category._id), {
      _id: category._id,
      name: category.name,
      slug: category.slug,
      image: category.image,
      parentCategory: category.parentCategory,
      level: category.level,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      isFeatured: category.isFeatured,
      showOnHomepage: category.showOnHomepage,
      children: [],
    });
  });

  const tree = [];
  nodeMap.forEach((node) => {
    if (node.parentCategory && nodeMap.has(String(node.parentCategory))) {
      nodeMap.get(String(node.parentCategory)).children.push(node);
    } else {
      tree.push(node);
    }
  });

  res.status(200).json(new ApiResponse(200, { tree }, 'Category tree fetched successfully'));
});

export const getCategoryByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const privileged = isAdminUser(req);

  const filter = isValidObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };
  if (!privileged) {
    filter.isActive = true;
    filter.isDeleted = { $ne: true };
  }

  const category = await Category.findOne(filter)
    .populate('parentCategory', 'name slug')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

  if (!category) throw new ApiError(404, 'Category not found');

  res.status(200).json(new ApiResponse(200, { category }, 'Category fetched successfully'));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!category) throw new ApiError(404, 'Category not found');

  const { name, description, shortDescription, parentCategory, displayOrder, isActive, isFeatured, showOnHomepage, seo } =
    req.body;

  if (parentCategory !== undefined && parentCategory !== '') {
    if (!isValidObjectId(parentCategory)) throw new ApiError(400, 'Invalid parent category id');

    const parentExists = await Category.findOne({ _id: parentCategory, isDeleted: { $ne: true } });
    if (!parentExists) throw new ApiError(404, 'Parent category not found');

    const createsCycle = await Category.wouldCreateCycle(category._id, parentCategory);
    if (createsCycle) {
      throw new ApiError(400, 'This parent selection would create a circular category hierarchy');
    }

    category.parentCategory = parentCategory;
    category.level = parentExists.level + 1;
  } else if (parentCategory === '') {
    category.parentCategory = null;
    category.level = 0;
  }

  if (req.files?.image?.[0]) {
    await deleteImage(category.image?.publicId);
    category.image = await uploadImage(req.files.image[0].buffer, 'tgs/categories');
  }
  if (req.files?.banner?.[0]) {
    await deleteImage(category.banner?.publicId);
    category.banner = await uploadImage(req.files.banner[0].buffer, 'tgs/categories/banners');
  }

  if (name !== undefined) category.name = name;
  if (description !== undefined) category.description = description;
  if (shortDescription !== undefined) category.shortDescription = shortDescription;
  if (displayOrder !== undefined) category.displayOrder = displayOrder;
  if (isActive !== undefined) category.isActive = isActive;
  if (isFeatured !== undefined) category.isFeatured = isFeatured;
  if (showOnHomepage !== undefined) category.showOnHomepage = showOnHomepage;

  const parsedSeo = parseSeo(seo);
  if (parsedSeo !== undefined) category.seo = parsedSeo;

  category.updatedBy = req.user._id;

  await category.save();

  res.status(200).json(new ApiResponse(200, { category }, 'Category updated successfully'));
});

export const updateCategoryStatus = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!category) throw new ApiError(404, 'Category not found');

  category.isActive = req.body.isActive;
  category.updatedBy = req.user._id;
  await category.save();

  res.status(200).json(new ApiResponse(200, { category }, 'Category status updated successfully'));
});

export const updateCategoryFeature = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!category) throw new ApiError(404, 'Category not found');

  if (req.body.isFeatured !== undefined) category.isFeatured = req.body.isFeatured;
  if (req.body.showOnHomepage !== undefined) category.showOnHomepage = req.body.showOnHomepage;
  category.updatedBy = req.user._id;
  await category.save();

  res.status(200).json(new ApiResponse(200, { category }, 'Category feature settings updated successfully'));
});

export const reorderCategories = asyncHandler(async (req, res) => {
  const { items } = req.body;

  const ids = items.map((item) => item.id);
  const existingCount = await Category.countDocuments({ _id: { $in: ids }, isDeleted: { $ne: true } });
  if (existingCount !== ids.length) {
    throw new ApiError(404, 'One or more categories could not be found');
  }

  const bulkOps = items.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { $set: { displayOrder: item.displayOrder, updatedBy: req.user._id } },
    },
  }));

  await Category.bulkWrite(bulkOps);

  const categories = await Category.find({ _id: { $in: ids } }).sort({ displayOrder: 1 });

  res.status(200).json(new ApiResponse(200, { categories }, 'Category order updated successfully'));
});

export const softDeleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!category) throw new ApiError(404, 'Category not found');

  const childCount = await Category.countDocuments({ parentCategory: category._id, isDeleted: { $ne: true } });
  if (childCount > 0) {
    throw new ApiError(400, 'Cannot delete a category that has active subcategories. Move or delete them first.');
  }

  category.isDeleted = true;
  category.isActive = false;
  category.deletedAt = new Date();
  category.updatedBy = req.user._id;
  await category.save();

  res.status(200).json(new ApiResponse(200, null, 'Category moved to trash successfully'));
});

export const restoreCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, isDeleted: true });
  if (!category) throw new ApiError(404, 'Deleted category not found');

  if (category.parentCategory) {
    const parent = await Category.findOne({ _id: category.parentCategory, isDeleted: { $ne: true } });
    if (!parent) {
      category.parentCategory = null;
      category.level = 0;
    }
  }

  category.isDeleted = false;
  category.deletedAt = null;
  category.updatedBy = req.user._id;
  await category.save();

  res.status(200).json(new ApiResponse(200, { category }, 'Category restored successfully'));
});

export const permanentlyDeleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');

  const childCount = await Category.countDocuments({ parentCategory: category._id });
  if (childCount > 0) {
    throw new ApiError(400, 'Cannot permanently delete a category that still has subcategories');
  }

  await Promise.all([deleteImage(category.image?.publicId), deleteImage(category.banner?.publicId)]);
  await category.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Category permanently deleted'));
});
