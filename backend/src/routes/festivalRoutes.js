import express from 'express';
import { protect, authorizeRoles, attachUserIfPresent } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { parseMultipartJson } from '../middleware/parseMultipartJson.js';
import {
  createFestival,
  getFestivals,
  getFestivalById,
  updateFestival,
  deleteFestival,
  getActiveFestival,
  getFeaturedSectionBySlug,
} from '../controllers/festivalController.js';
import {
  createFestivalSchema,
  updateFestivalSchema,
} from '../validations/festivalValidation.js';

const router = express.Router();

// Public route for fetching active festival
router.get('/active', attachUserIfPresent, getActiveFestival);

// Public route for fetching featured section by slug
router.get('/featured/:slug', attachUserIfPresent, getFeaturedSectionBySlug);

// Admin-only routes
router.use(protect, authorizeRoles('admin', 'superadmin'));

router.get('/', getFestivals);
router.get('/:id', getFestivalById);
router.post(
  '/',
  upload.any(),
  parseMultipartJson([
    'announcement',
    'featuredTags',
    'featuredCollections',
    'heroBanners',
    'homepage',
    'featuredSections',
  ]),
  validate(createFestivalSchema),
  createFestival
);
router.put(
  '/:id',
  (req, res, next) => {
    console.log("=== BEFORE MULTER ===");
    next();
  },
  upload.any(),
  (req, res, next) => {
    console.log("=== AFTER MULTER ===");
    console.log(req.files);
    console.log(req.body);
    next();
  },
  parseMultipartJson([
    'announcement',
    'featuredTags',
    'featuredCollections',
    'heroBanners',
    'homepage',
    'featuredSections',
  ]),
  validate(updateFestivalSchema),
  updateFestival
);
router.delete('/:id', deleteFestival);

export default router;
