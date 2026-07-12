import express from 'express';
import {
  createBanner,
  getBanners,
  updateBanner,
  updateBannerStatus,
  reorderBanners,
  deleteBanner,
  permanentlyDeleteBanner,
  createFeaturedItem,
  getFeaturedItems,
  updateFeaturedItem,
  updateFeaturedItemStatus,
  reorderFeaturedItems,
  deleteFeaturedItem,
  getBudgetCollections,
  upsertBudgetCollection,
  getSiteSettings,
  updateAnnouncementBar,
  updateWelcomePopup,
  getHomepageContent,
} from '../controllers/marketingController.js';
import { protect, authorizeRoles, attachUserIfPresent } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  createBannerSchema,
  updateBannerSchema,
  createFeaturedItemSchema,
  updateFeaturedItemSchema,
  upsertBudgetCollectionSchema,
  statusSchema,
  reorderSchema,
  announcementBarSchema,
  welcomePopupSchema,
} from '../validations/marketingValidation.js';

const router = express.Router();

const bannerImages = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'mobileImage', maxCount: 1 },
]);
const singleImage = upload.fields([{ name: 'image', maxCount: 1 }]);

/* ---- Public read routes ---- */
// Single aggregated call for the entire homepage marketing payload.
router.get('/homepage', getHomepageContent);

router.get('/banners', attachUserIfPresent, getBanners);
router.get('/featured-items', attachUserIfPresent, getFeaturedItems);
router.get('/budget-collections', attachUserIfPresent, getBudgetCollections);
router.get('/settings', getSiteSettings);

/* ---- Admin-only write routes ---- */
router.use(protect, authorizeRoles('admin', 'superadmin'));

router.post('/banners', bannerImages, validate(createBannerSchema), createBanner);
router.patch('/banners/reorder', validate(reorderSchema), reorderBanners);
router.patch('/banners/:id/status', validate(statusSchema), updateBannerStatus);
router.put('/banners/:id', bannerImages, validate(updateBannerSchema), updateBanner);
router.patch('/banners/:id', bannerImages, validate(updateBannerSchema), updateBanner);
router.delete('/banners/:id/permanent', authorizeRoles('superadmin'), permanentlyDeleteBanner);
router.delete('/banners/:id', deleteBanner);

router.post('/featured-items', singleImage, validate(createFeaturedItemSchema), createFeaturedItem);
router.patch('/featured-items/reorder', validate(reorderSchema), reorderFeaturedItems);
router.patch('/featured-items/:id/status', validate(statusSchema), updateFeaturedItemStatus);
router.put('/featured-items/:id', singleImage, validate(updateFeaturedItemSchema), updateFeaturedItem);
router.patch('/featured-items/:id', singleImage, validate(updateFeaturedItemSchema), updateFeaturedItem);
router.delete('/featured-items/:id', deleteFeaturedItem);

router.put(
  '/budget-collections/:tier',
  singleImage,
  validate(upsertBudgetCollectionSchema),
  upsertBudgetCollection
);

router.put('/settings/announcement-bar', validate(announcementBarSchema), updateAnnouncementBar);
router.put('/settings/welcome-popup', singleImage, validate(welcomePopupSchema), updateWelcomePopup);

export default router;
