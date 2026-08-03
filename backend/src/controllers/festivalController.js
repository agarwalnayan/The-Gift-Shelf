import Festival from '../models/Festival.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { uploadImage, deleteImage } from '../services/cloudinaryService.js';

const getUploadedFile = (fieldname, files) =>
  files?.find((file) => file.fieldname === fieldname);

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
    featuredSections,
    displayOrder,
    isActive,
  } = req.body;

  // Upload festival badge image if provided
  let festivalBadge = {
    url: '',
    publicId: '',
  };

  const badgeFile = getUploadedFile('festivalBadge', req.files);
  if (badgeFile) {
    festivalBadge = await uploadImage(
      badgeFile.buffer,
      'tgs/festivals/badges'
    );
  }

  // Process featured sections with image uploads
  let processedFeaturedSections = [];
  if (featuredSections && Array.isArray(featuredSections)) {
    processedFeaturedSections = await Promise.all(
      featuredSections.map(async (section, index) => {
        let sectionImage = { url: '', publicId: '' };
        const imageKey = `featuredSectionImage_${index}`;
        const imageFile = getUploadedFile(imageKey, req.files);
        
        if (imageFile) {
          sectionImage = await uploadImage(
            imageFile.buffer,
            'tgs/festivals/featured-sections'
          );
        }

        return {
          ...section,
          image: sectionImage,
        };
      })
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
    featuredSections: processedFeaturedSections,
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
    featuredSections,
    displayOrder,
    isActive,
  } = req.body;

  // Handle festival badge
  const badgeFile = getUploadedFile('festivalBadge', req.files);
  if (badgeFile) {
    await deleteImage(festival.festivalBadge?.publicId);
    festival.festivalBadge = await uploadImage(badgeFile.buffer, 'tgs/festivals/badges');
  }

  // Handle featured sections with image uploads/deletions
  if (featuredSections !== undefined && Array.isArray(featuredSections)) {
    // Delete old images for sections that are being removed or replaced
    const oldSections = festival.featuredSections || [];
    const newSectionIds = featuredSections.map((_, index) => index);
    
    // Delete images for sections that no longer exist
    for (let i = 0; i < oldSections.length; i++) {
      if (!newSectionIds.includes(i)) {
        await deleteImage(oldSections[i].image?.publicId);
      }
    }

    // Process new/updated sections with image uploads
    const processedFeaturedSections = await Promise.all(
      featuredSections.map(async (section, index) => {
        let sectionImage = section.image || { url: '', publicId: '' };
        const imageKey = `featuredSectionImage_${index}`;
        const imageFile = getUploadedFile(imageKey, req.files);
        
        // If new image uploaded, delete old one and upload new
        if (imageFile) {
          const oldImage = oldSections[index]?.image;
          if (oldImage?.publicId) {
            await deleteImage(oldImage.publicId);
          }
          sectionImage = await uploadImage(
            imageFile.buffer,
            'tgs/festivals/featured-sections'
          );
        } else if (oldSections[index]?.image) {
          // Keep existing image if no new upload
          sectionImage = oldSections[index].image;
        }

        return {
          ...section,
          image: sectionImage,
        };
      })
    );

    festival.featuredSections = processedFeaturedSections;
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

  // Delete festival badge
  await deleteImage(festival.festivalBadge?.publicId);

  // Delete featured section images
  if (festival.featuredSections && Array.isArray(festival.featuredSections)) {
    await Promise.all(
      festival.featuredSections.map((section) =>
        deleteImage(section.image?.publicId)
      )
    );
  }

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

export const getFeaturedSectionBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  
  const now = new Date();
  const festival = await Festival.findOne({
    enabled: true,
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  });

  if (!festival) {
    throw new ApiError(404, 'No active festival found');
  }

  const featuredSection = festival.featuredSections?.find(
    (section) => section.slug === slug && section.isActive
  );

  if (!featuredSection) {
    throw new ApiError(404, 'Featured section not found');
  }

  // Populate products for the featured section
  const populatedSection = await Festival.aggregate([
    { $match: { _id: festival._id } },
    { $unwind: '$featuredSections' },
    { $match: { 'featuredSections.slug': slug, 'featuredSections.isActive': true } },
    {
      $lookup: {
        from: 'products',
        localField: 'featuredSections.products',
        foreignField: '_id',
        as: 'featuredSections.products',
      },
    },
    { $project: { featuredSections: 1 } },
  ]);

  if (!populatedSection || populatedSection.length === 0) {
    throw new ApiError(404, 'Featured section not found');
  }

  res.status(200).json(new ApiResponse(200, { featuredSection: populatedSection[0].featuredSections }, 'Featured section fetched successfully'));
});
