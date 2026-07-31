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
} from '../controllers/festivalController.js';
import {
  createFestivalSchema,
  updateFestivalSchema,
} from '../validations/festivalValidation.js';

const router = express.Router();

// Public route for fetching active festival
router.get('/active', attachUserIfPresent, getActiveFestival);

// Admin-only routes
router.use(protect, authorizeRoles('admin', 'superadmin'));

router.get('/', getFestivals);
router.get('/:id', getFestivalById);
router.post(
  '/',
  upload.fields([
    { name: 'festivalBadge', maxCount: 1 },
  ]),
  parseMultipartJson([
    'announcement',
    'featuredTags',
    'featuredCollections',
    'heroBanners',
    'homepage',
  ]),
  validate(createFestivalSchema),
  createFestival
);
router.put(
  '/:id',
  upload.fields([
    { name: 'festivalBadge', maxCount: 1 },
  ]),
  parseMultipartJson([
    'announcement',
    'featuredTags',
    'featuredCollections',
    'heroBanners',
    'homepage',
  ]),
  validate(updateFestivalSchema),
  updateFestival
);
router.delete('/:id', deleteFestival);

export default router;
