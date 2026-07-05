import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:slug', getProductBySlug);

router.use(protect, authorizeRoles('admin', 'superadmin'));

router.post('/', upload.array('images', 6), createProduct);
router.patch('/:id', upload.array('images', 6), updateProduct);
router.delete('/:id', deleteProduct);

export default router;
