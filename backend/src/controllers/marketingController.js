import Banner from '../models/Banner.js';
import FeaturedItem from '../models/FeaturedItem.js';
import BudgetCollection from '../models/BudgetCollection.js';
import SiteSettings from '../models/SiteSettings.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { uploadImage, deleteImage } from '../services/cloudinaryService.js';

const isAdminUser = (req) => Boolean(req.user && ['admin', 'superadmin'].includes(req.user.role));

/* =========================================================================
 * BANNERS (Hero Banner Management + Promotional Banner Management)
 * ========================================================================= */

export const createBanner = asyncHandler(async (req, res) => {
  const { type, title, subtitle, description, ctaText, ctaLink, displayOrder, isActive, startDate, endDate } =
    req.body;

  let image = { url: '', publicId: '' };
  let mobileImage = { url: '', publicId: '' };

  if (req.files?.image?.[0]) {
    image = await uploadImage(req.files.image[0].buffer, 'tgs/marketing/banners');
  }
  if (req.files?.mobileImage?.[0]) {
    mobileImage = await uploadImage(req.files.mobileImage[0].buffer, 'tgs/marketing/banners');
  }

  const banner = await Banner.create({
    type,
    title,
    subtitle,
    description,
    ctaText,
    ctaLink,
    displayOrder: displayOrder ?? 0,
    isActive: isActive ?? true,
    startDate: startDate || null,
    endDate: endDate || null,
    image,
    mobileImage,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, { banner }, 'Banner created successfully'));
});

export const getBanners = asyncHandler(async (req, res) => {
  const privileged = isAdminUser(req);
  const { type } = req.query;

  if (!type || !['hero', 'promo'].includes(type)) {
    throw new ApiError(400, 'A valid banner type (hero or promo) is required');
  }

  const filter = privileged ? { type, isDeleted: { $ne: true } } : Banner.liveFilter(type);

  const banners = await Banner.find(filter).sort({ displayOrder: 1 });

  res.status(200).json(new ApiResponse(200, { banners, count: banners.length }, 'Banners fetched successfully'));
});

export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!banner) throw new ApiError(404, 'Banner not found');

  const { type, title, subtitle, description, ctaText, ctaLink, displayOrder, isActive, startDate, endDate, removeImage, removeMobileImage } =
    req.body;

  if (req.files?.image?.[0]) {
    await deleteImage(banner.image?.publicId);
    banner.image = await uploadImage(req.files.image[0].buffer, 'tgs/marketing/banners');
  } else if (removeImage === true || removeImage === 'true') {
    await deleteImage(banner.image?.publicId);
    banner.image = { url: '', publicId: '' };
  }

  if (req.files?.mobileImage?.[0]) {
    await deleteImage(banner.mobileImage?.publicId);
    banner.mobileImage = await uploadImage(req.files.mobileImage[0].buffer, 'tgs/marketing/banners');
  } else if (removeMobileImage === true || removeMobileImage === 'true') {
    await deleteImage(banner.mobileImage?.publicId);
    banner.mobileImage = { url: '', publicId: '' };
  }

  if (type !== undefined) banner.type = type;
  if (title !== undefined) banner.title = title;
  if (subtitle !== undefined) banner.subtitle = subtitle;
  if (description !== undefined) banner.description = description;
  if (ctaText !== undefined) banner.ctaText = ctaText;
  if (ctaLink !== undefined) banner.ctaLink = ctaLink;
  if (displayOrder !== undefined) banner.displayOrder = displayOrder;
  if (isActive !== undefined) banner.isActive = isActive;
  if (startDate !== undefined) banner.startDate = startDate || null;
  if (endDate !== undefined) banner.endDate = endDate || null;

  banner.updatedBy = req.user._id;
  await banner.save();

  res.status(200).json(new ApiResponse(200, { banner }, 'Banner updated successfully'));
});

export const updateBannerStatus = asyncHandler(async (req, res) => {
  const banner = await Banner.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!banner) throw new ApiError(404, 'Banner not found');

  banner.isActive = req.body.isActive;
  banner.updatedBy = req.user._id;
  await banner.save();

  res.status(200).json(new ApiResponse(200, { banner }, 'Banner status updated successfully'));
});

export const reorderBanners = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const ids = items.map((item) => item.id);

  const existingCount = await Banner.countDocuments({ _id: { $in: ids }, isDeleted: { $ne: true } });
  if (existingCount !== ids.length) throw new ApiError(404, 'One or more banners could not be found');

  const bulkOps = items.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { $set: { displayOrder: item.displayOrder, updatedBy: req.user._id } },
    },
  }));
  await Banner.bulkWrite(bulkOps);

  const banners = await Banner.find({ _id: { $in: ids } }).sort({ displayOrder: 1 });
  res.status(200).json(new ApiResponse(200, { banners }, 'Banner order updated successfully'));
});

export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!banner) throw new ApiError(404, 'Banner not found');

  banner.isDeleted = true;
  banner.isActive = false;
  banner.deletedAt = new Date();
  banner.updatedBy = req.user._id;
  await banner.save();

  res.status(200).json(new ApiResponse(200, null, 'Banner moved to trash successfully'));
});

export const permanentlyDeleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) throw new ApiError(404, 'Banner not found');

  await Promise.all([deleteImage(banner.image?.publicId), deleteImage(banner.mobileImage?.publicId)]);
  await banner.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Banner permanently deleted'));
});

/* =========================================================================
 * FEATURED ITEMS (Featured Recipient + Featured Occasion sections)
 * ========================================================================= */

export const createFeaturedItem = asyncHandler(async (req, res) => {
  const { type, name, value, displayOrder, isActive } = req.body;

  const activeCount = await FeaturedItem.countDocuments({ type, isDeleted: { $ne: true } });
  if (activeCount >= FeaturedItem.MAX_ITEMS_PER_TYPE) {
    throw new ApiError(
      400,
      `You can feature at most ${FeaturedItem.MAX_ITEMS_PER_TYPE} ${type === 'recipient' ? 'recipients' : 'occasions'} on the homepage. Remove one before adding another.`
    );
  }

  let image = { url: '', publicId: '' };
  if (req.files?.image?.[0]) {
    image = await uploadImage(req.files.image[0].buffer, 'tgs/marketing/featured');
  }

  const item = await FeaturedItem.create({
    type,
    name,
    value,
    displayOrder: displayOrder ?? 0,
    isActive: isActive ?? true,
    image,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, { item }, 'Featured item created successfully'));
});

export const getFeaturedItems = asyncHandler(async (req, res) => {
  const privileged = isAdminUser(req);
  const { type } = req.query;

  if (!type || !['recipient', 'occasion'].includes(type)) {
    throw new ApiError(400, 'A valid featured item type (recipient or occasion) is required');
  }

  const filter = { type, isDeleted: { $ne: true } };
  if (!privileged) filter.isActive = true;

  let query = FeaturedItem.find(filter).sort({ displayOrder: 1 });
  if (!privileged) query = query.limit(FeaturedItem.MAX_ITEMS_PER_TYPE);

  const items = await query;

  res.status(200).json(new ApiResponse(200, { items, count: items.length }, 'Featured items fetched successfully'));
});

export const updateFeaturedItem = asyncHandler(async (req, res) => {
  const item = await FeaturedItem.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!item) throw new ApiError(404, 'Featured item not found');

  const { name, value, displayOrder, isActive } = req.body;

  if (req.files?.image?.[0]) {
    await deleteImage(item.image?.publicId);
    item.image = await uploadImage(req.files.image[0].buffer, 'tgs/marketing/featured');
  }

  if (name !== undefined) item.name = name;
  if (value !== undefined) item.value = value;
  if (displayOrder !== undefined) item.displayOrder = displayOrder;
  if (isActive !== undefined) item.isActive = isActive;

  item.updatedBy = req.user._id;
  await item.save();

  res.status(200).json(new ApiResponse(200, { item }, 'Featured item updated successfully'));
});

export const updateFeaturedItemStatus = asyncHandler(async (req, res) => {
  const item = await FeaturedItem.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!item) throw new ApiError(404, 'Featured item not found');

  item.isActive = req.body.isActive;
  item.updatedBy = req.user._id;
  await item.save();

  res.status(200).json(new ApiResponse(200, { item }, 'Featured item status updated successfully'));
});

export const reorderFeaturedItems = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const ids = items.map((item) => item.id);

  const existingCount = await FeaturedItem.countDocuments({ _id: { $in: ids }, isDeleted: { $ne: true } });
  if (existingCount !== ids.length) throw new ApiError(404, 'One or more featured items could not be found');

  const bulkOps = items.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { $set: { displayOrder: item.displayOrder, updatedBy: req.user._id } },
    },
  }));
  await FeaturedItem.bulkWrite(bulkOps);

  const updated = await FeaturedItem.find({ _id: { $in: ids } }).sort({ displayOrder: 1 });
  res.status(200).json(new ApiResponse(200, { items: updated }, 'Featured item order updated successfully'));
});

export const deleteFeaturedItem = asyncHandler(async (req, res) => {
  const item = await FeaturedItem.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
  if (!item) throw new ApiError(404, 'Featured item not found');

  item.isDeleted = true;
  item.isActive = false;
  item.deletedAt = new Date();
  item.updatedBy = req.user._id;
  await item.save();

  res.status(200).json(new ApiResponse(200, null, 'Featured item removed successfully'));
});

/* =========================================================================
 * BUDGET COLLECTIONS (fixed 3 tiers: Under 499 / 500-999 / Premium)
 * ========================================================================= */

export const getBudgetCollections = asyncHandler(async (req, res) => {
  const privileged = isAdminUser(req);
  const filter = privileged ? {} : { isActive: true };

  let collections = await BudgetCollection.find(filter).sort({ displayOrder: 1 });

  // Seed defaults on first admin visit so the 3 tiers always exist to edit.
  if (privileged && collections.length === 0) {
    await BudgetCollection.insertMany(BudgetCollection.DEFAULT_TIERS);
    collections = await BudgetCollection.find({}).sort({ displayOrder: 1 });
  }

  res
    .status(200)
    .json(new ApiResponse(200, { collections, count: collections.length }, 'Budget collections fetched successfully'));
});

export const upsertBudgetCollection = asyncHandler(async (req, res) => {
  const { tier } = req.params;
  if (!BudgetCollection.DEFAULT_TIERS.some((t) => t.tier === tier)) {
    throw new ApiError(400, 'Invalid budget collection tier');
  }

  const { label, description, minPrice, maxPrice, displayOrder, isActive } = req.body;

  let collection = await BudgetCollection.findOne({ tier });
  if (!collection) {
    const defaults = BudgetCollection.DEFAULT_TIERS.find((t) => t.tier === tier);
    collection = new BudgetCollection(defaults);
  }

  if (req.files?.image?.[0]) {
    await deleteImage(collection.image?.publicId);
    collection.image = await uploadImage(req.files.image[0].buffer, 'tgs/marketing/budget');
  }

  if (label !== undefined) collection.label = label;
  if (description !== undefined) collection.description = description;
  if (minPrice !== undefined) collection.minPrice = minPrice;
  if (maxPrice !== undefined) collection.maxPrice = maxPrice === '' ? null : maxPrice;
  if (displayOrder !== undefined) collection.displayOrder = displayOrder;
  if (isActive !== undefined) collection.isActive = isActive;

  collection.updatedBy = req.user._id;
  await collection.save();

  res.status(200).json(new ApiResponse(200, { collection }, 'Budget collection updated successfully'));
});

/* =========================================================================
 * SITE SETTINGS (Announcement Bar + Welcome Popup)
 * ========================================================================= */

export const getSiteSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSingleton();
  res.status(200).json(new ApiResponse(200, { settings }, 'Site settings fetched successfully'));
});

export const updateAnnouncementBar = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSingleton();
  settings.announcementBar = { ...settings.announcementBar.toObject(), ...req.body };
  settings.updatedBy = req.user._id;
  await settings.save();

  res
    .status(200)
    .json(new ApiResponse(200, { announcementBar: settings.announcementBar }, 'Announcement bar updated successfully'));
});

export const updateCommerceSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSingleton();
  const {
    freeShippingThreshold,
    shippingCharge,
    whatsappCharge,
    whatsappNumber,
    checkoutMessage,
    paymentOptions,
    returnPolicy,
    replacementPolicy,
  } = req.body;

  const current = settings.commerce.toObject();

  settings.commerce = {
    ...current,
    ...(freeShippingThreshold !== undefined && { freeShippingThreshold }),
    ...(shippingCharge !== undefined && { shippingCharge }),
    ...(whatsappCharge !== undefined && { whatsappCharge }),
    ...(whatsappNumber !== undefined && { whatsappNumber }),
    ...(checkoutMessage !== undefined && { checkoutMessage }),
    ...(returnPolicy !== undefined && { returnPolicy }),
    ...(replacementPolicy !== undefined && { replacementPolicy }),
    ...(paymentOptions !== undefined && {
      paymentOptions: { ...current.paymentOptions, ...paymentOptions },
    }),
  };

  settings.updatedBy = req.user._id;
  await settings.save();

  res.status(200).json(new ApiResponse(200, { commerce: settings.commerce }, 'Checkout settings updated successfully'));
});

export const updateWelcomePopup = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSingleton();
  const { enabled, title, description, ctaText, ctaLink, delaySeconds, showOncePerSession, removeImage } = req.body;

  if (req.files?.image?.[0]) {
    await deleteImage(settings.welcomePopup.image?.publicId);
    settings.welcomePopup.image = await uploadImage(req.files.image[0].buffer, 'tgs/marketing/popup');
  } else if (removeImage === true || removeImage === 'true') {
    await deleteImage(settings.welcomePopup.image?.publicId);
    settings.welcomePopup.image = { url: '', publicId: '' };
  }

  if (enabled !== undefined) settings.welcomePopup.enabled = enabled;
  if (title !== undefined) settings.welcomePopup.title = title;
  if (description !== undefined) settings.welcomePopup.description = description;
  if (ctaText !== undefined) settings.welcomePopup.ctaText = ctaText;
  if (ctaLink !== undefined) settings.welcomePopup.ctaLink = ctaLink;
  if (delaySeconds !== undefined) settings.welcomePopup.delaySeconds = delaySeconds;
  if (showOncePerSession !== undefined) settings.welcomePopup.showOncePerSession = showOncePerSession;

  settings.updatedBy = req.user._id;
  await settings.save();

  res.status(200).json(new ApiResponse(200, { welcomePopup: settings.welcomePopup }, 'Welcome popup updated successfully'));
});

/* =========================================================================
 * HOMEPAGE AGGREGATOR
 * Single public endpoint bundling every marketing section the storefront
 * homepage needs, fetched in parallel server-side. This replaces what would
 * otherwise be 7 separate client requests on every homepage load (the
 * source of the duplicate-request / 429 issue), cutting it to exactly 1.
 * ========================================================================= */

export const getHomepageContent = asyncHandler(async (req, res) => {
  const [heroBanners, promoBanners, featuredRecipients, featuredOccasions, budgetCollections, settings] =
    await Promise.all([
      Banner.find(Banner.liveFilter('hero')).sort({ displayOrder: 1 }),
      Banner.find(Banner.liveFilter('promo')).sort({ displayOrder: 1 }),
      FeaturedItem.find({ type: 'recipient', isDeleted: { $ne: true }, isActive: true })
        .sort({ displayOrder: 1 })
        .limit(FeaturedItem.MAX_ITEMS_PER_TYPE),
      FeaturedItem.find({ type: 'occasion', isDeleted: { $ne: true }, isActive: true })
        .sort({ displayOrder: 1 })
        .limit(FeaturedItem.MAX_ITEMS_PER_TYPE),
      BudgetCollection.find({ isActive: true }).sort({ displayOrder: 1 }),
      SiteSettings.getSingleton(),
    ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        heroBanners,
        promoBanners,
        featuredRecipients,
        featuredOccasions,
        budgetCollections,
        announcementBar: settings.announcementBar,
        welcomePopup: settings.welcomePopup,
        commerce: settings.commerce,
      },
      'Homepage content fetched successfully'
    )
  );
});