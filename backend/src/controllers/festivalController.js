import Festival from '../models/Festival.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { uploadImage, deleteImage } from '../services/cloudinaryService.js';

export const createFestival = asyncHandler(async (req, res) => {
  const {
    name,
    slug,
    enabled,
    startDate,
    endDate,
    themeColor,
    announcement,
    featuredTags,
    featuredCollections,
    heroBanners,
    homepage,
    displayOrder,
    isActive,
  } = req.body;

  // Upload festival badge image if provided
  let festivalBadge = {
    url: '',
    publicId: '',
  };

  if (req.files?.festivalBadge?.[0]) {
    festivalBadge = await uploadImage(
      req.files.festivalBadge[0].buffer,
      'tgs/festivals/badges'
    );
  }

  const festival = await Festival.create({
    name,
    slug,
    enabled,
    startDate,
    endDate,
    festivalBadge,
    themeColor,
    announcement,
    featuredTags,
    featuredCollections,
    heroBanners,
    homepage,
    displayOrder,
    isActive,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, { festival }, 'Festival created successfully'));
});

export const getFestivals = asyncHandler(async (req, res) => {
  const festivals = await Festival.find()
    .populate('heroBanners')
    .populate('featuredCollections', 'name tier image')
    .sort({ displayOrder: 1, createdAt: -1 });

  res.status(200).json(new ApiResponse(200, { festivals }, 'Festivals fetched successfully'));
});

export const getFestivalById = asyncHandler(async (req, res) => {
  const festival = await Festival.findById(req.params.id)
    .populate('featuredCollections', 'name tier image')
    .populate('heroBanners');

  if (!festival) throw new ApiError(404, 'Festival not found');

  res.status(200).json(new ApiResponse(200, { festival }, 'Festival fetched successfully'));
});

export const updateFestival = asyncHandler(async (req, res) => {
  const festival = await Festival.findById(req.params.id);
  if (!festival) throw new ApiError(404, 'Festival not found');

  const {
    name,
    slug,
    enabled,
    startDate,
    endDate,
    themeColor,
    announcement,
    featuredTags,
    featuredCollections,
    heroBanners,
    homepage,
    displayOrder,
    isActive,
  } = req.body;

  // Handle festival badge
  if (req.files?.festivalBadge?.[0]) {
    await deleteImage(festival.festivalBadge?.publicId);
    festival.festivalBadge = await uploadImage(req.files.festivalBadge[0].buffer, 'tgs/festivals/badges');
  }

  if (name !== undefined) festival.name = name;
  if (slug !== undefined) festival.slug = slug;
  if (enabled !== undefined) festival.enabled = enabled;
  if (startDate !== undefined) festival.startDate = startDate;
  if (endDate !== undefined) festival.endDate = endDate;
  if (themeColor !== undefined) festival.themeColor = themeColor;
  if (announcement !== undefined) festival.announcement = announcement;
  if (featuredTags !== undefined) festival.featuredTags = featuredTags;
  if (featuredCollections !== undefined) festival.featuredCollections = featuredCollections;
  if (heroBanners !== undefined) { festival.heroBanners = heroBanners; }
  if (homepage !== undefined) festival.homepage = homepage;
  if (displayOrder !== undefined) festival.displayOrder = displayOrder;
  if (isActive !== undefined) festival.isActive = isActive;

  festival.updatedBy = req.user._id;
  await festival.save();

  res.status(200).json(new ApiResponse(200, { festival }, 'Festival updated successfully'));
});

export const deleteFestival = asyncHandler(async (req, res) => {
  const festival = await Festival.findById(req.params.id);
  if (!festival) throw new ApiError(404, 'Festival not found');

  await deleteImage(festival.festivalBadge?.publicId);

  await festival.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Festival deleted successfully'));
});

export const getActiveFestival = asyncHandler(async (req, res) => {
  const now = new Date();
  const festival = await Festival.findOne({
    enabled: true,
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .populate('heroBanners')
    .populate('featuredCollections', 'name tier image')
    .populate('homepage.products', 'name slug price discountPrice primaryImage category')

  if (!festival) {
    return res.status(200).json(new ApiResponse(200, { festival: null }, 'No active festival found'));
  }

  res.status(200).json(new ApiResponse(200, { festival }, 'Active festival fetched successfully'));
});
