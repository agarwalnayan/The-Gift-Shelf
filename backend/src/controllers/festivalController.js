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
  featuredProducts,
  featuredCollections,
  displayOrder,
  isActive,
} = req.body;

// Upload images if provided
let desktopBanner = {
  url: '',
  publicId: '',
};

let mobileBanner = {
  url: '',
  publicId: '',
};

let festivalBadge = {
  url: '',
  publicId: '',
};

if (req.files?.desktopBanner?.[0]) {
  desktopBanner = await uploadImage(
    req.files.desktopBanner[0].buffer,
    'tgs/festivals'
  );
}

if (req.files?.mobileBanner?.[0]) {
  mobileBanner = await uploadImage(
    req.files.mobileBanner[0].buffer,
    'tgs/festivals'
  );
}

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
    desktopBanner,
    mobileBanner,
    festivalBadge,
    themeColor,
    announcement,
    featuredProducts,
    featuredCollections,
    displayOrder,
    isActive,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, { festival }, 'Festival created successfully'));
});

export const getFestivals = asyncHandler(async (req, res) => {
const festivals = await Festival.find()    
  .populate('featuredProducts', 'name images price')
  .populate('featuredCollections', 'name tier image')
  .sort({ displayOrder: 1, createdAt: -1 });

  res.status(200).json(new ApiResponse(200, { festivals }, 'Festivals fetched successfully'));
});

export const getFestivalById = asyncHandler(async (req, res) => {
  const festival = await Festival.findById(req.params.id)
    .populate('featuredProducts', 'name images price')
    .populate('featuredCollections', 'name tier image')

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
    featuredProducts,
    featuredCollections,
    displayOrder,
    isActive,
  } = req.body;

  // Handle desktop banner
  if (req.files?.desktopBanner?.[0]) {
    await deleteImage(festival.desktopBanner?.publicId);
    festival.desktopBanner = await uploadImage(req.files.desktopBanner[0].buffer, 'tgs/festivals');
  }

  // Handle mobile banner
  if (req.files?.mobileBanner?.[0]) {
    await deleteImage(festival.mobileBanner?.publicId);
    festival.mobileBanner = await uploadImage(req.files.mobileBanner[0].buffer, 'tgs/festivals');
  }

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
  if (featuredProducts !== undefined) festival.featuredProducts = featuredProducts;
  if (featuredCollections !== undefined) festival.featuredCollections = featuredCollections;
  if (displayOrder !== undefined) festival.displayOrder = displayOrder;
  if (isActive !== undefined) festival.isActive = isActive;

  festival.updatedBy = req.user._id;
  await festival.save();

  res.status(200).json(new ApiResponse(200, { festival }, 'Festival updated successfully'));
});

export const deleteFestival = asyncHandler(async (req, res) => {
  const festival = await Festival.findById(req.params.id);
  if (!festival) throw new ApiError(404, 'Festival not found');

  await Promise.all([
    deleteImage(festival.desktopBanner?.publicId),
    deleteImage(festival.mobileBanner?.publicId),
    deleteImage(festival.festivalBadge?.publicId),
  ]);

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
    .populate('featuredProducts', 'name images price stock')
    .populate('featuredCollections', 'name tier image')

  if (!festival) {
    return res.status(200).json(new ApiResponse(200, { festival: null }, 'No active festival found'));
  }

  res.status(200).json(new ApiResponse(200, { festival }, 'Active festival fetched successfully'));
});
