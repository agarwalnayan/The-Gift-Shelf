import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryTree,
  getCategoryByIdOrSlug,
  updateCategory,
  updateCategoryStatus,
  updateCategoryFeature,
  reorderCategories,
  softDeleteCategory,
  restoreCategory,
  permanentlyDeleteCategory,
} from '../controllers/categoryController.js';
import { protect, authorizeRoles, attachUserIfPresent } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  createCategorySchema,
  updateCategorySchema,
  statusSchema,
  featureSchema,
  reorderSchema,
} from '../validations/categoryValidation.js';

const router = express.Router();

const categoryImages = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
]);

router.get('/tree', attachUserIfPresent, getCategoryTree);
router.get('/', attachUserIfPresent, getAllCategories);
router.get('/:idOrSlug', attachUserIfPresent, getCategoryByIdOrSlug);

router.use(protect, authorizeRoles('admin', 'superadmin'));

router.post('/', categoryImages, validate(createCategorySchema), createCategory);

router.patch('/reorder', validate(reorderSchema), reorderCategories);
router.patch('/:id/status', validate(statusSchema), updateCategoryStatus);
router.patch('/:id/feature', validate(featureSchema), updateCategoryFeature);
router.patch('/:id/restore', restoreCategory);
router.put('/:id', categoryImages, validate(updateCategorySchema), updateCategory);
router.patch('/:id', categoryImages, validate(updateCategorySchema), updateCategory);

router.delete('/:id/permanent', authorizeRoles('superadmin'), permanentlyDeleteCategory);
router.delete('/:id', softDeleteCategory);

export default router;
