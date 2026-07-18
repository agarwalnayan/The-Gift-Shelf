import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductByIdOrSlug,
  updateProduct,
  updateProductImages,
  updateProductStatus,
  updateProductPublishStatus,
  updateProductFeature,
  bulkProductAction,
  softDeleteProduct,
  restoreProduct,
  permanentlyDeleteProduct,
  uploadCustomizationImage,
} from '../controllers/productController.js';
import { protect, authorizeRoles, attachUserIfPresent } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  createProductSchema,
  updateProductSchema,
  productStatusSchema,
  productPublishSchema,
  productFeatureSchema,
  bulkActionSchema,
} from '../validations/productValidation.js';

const router = express.Router();

const productImages = upload.array('images', 8);

router.get('/', attachUserIfPresent, getAllProducts);
router.get('/:idOrSlug', attachUserIfPresent, getProductByIdOrSlug);

router.post('/:id/customization-image', upload.single('file'), uploadCustomizationImage);

router.use(protect, authorizeRoles('admin', 'superadmin'));

router.post('/', productImages, validate(createProductSchema), createProduct);

router.patch('/bulk', validate(bulkActionSchema), bulkProductAction);
router.patch('/:id/images', productImages, updateProductImages);
router.patch('/:id/status', validate(productStatusSchema), updateProductStatus);
router.patch('/:id/publish', validate(productPublishSchema), updateProductPublishStatus);
router.patch('/:id/feature', validate(productFeatureSchema), updateProductFeature);
router.patch('/:id/restore', restoreProduct);
router.put('/:id', productImages, validate(updateProductSchema), updateProduct);
router.patch('/:id', productImages, validate(updateProductSchema), updateProduct);

router.delete('/:id/permanent', authorizeRoles('superadmin'), permanentlyDeleteProduct);
router.delete('/:id', softDeleteProduct);

export default router;
