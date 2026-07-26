import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  createPromotion,
  getPromotions,
  getPromotionById,
  updatePromotion,
  updatePromotionStatus,
  deletePromotion,
  evaluatePromotions,
} from '../controllers/promotionController.js';
import {
  createPromotionSchema,
  updatePromotionSchema,
  promotionStatusSchema,
  evaluatePromotionsSchema,
} from '../validations/promotionValidation.js';
import { validate } from '../middleware/validateMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public evaluation endpoint (for cart/checkout)
router.post('/evaluate', validate(evaluatePromotionsSchema), evaluatePromotions);

// Public GET endpoint for active promotions (customer-facing) - no validation needed for GET
router.get('/', getPromotions);

// Admin-only routes (require authentication)
router.use(protect);
router.use(authorizeRoles('admin', 'superadmin'));

// Create promotion with error handling for multer
router.post('/', upload.single('bannerImage'), (err, req, res, next) => {
  if (err) {
    console.error('Multer error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
}, createPromotion);

router
  .route('/:id')
  .get(getPromotionById)
  .patch(upload.single('bannerImage'), updatePromotion)
  .delete(deletePromotion);

router.patch('/:id/status', updatePromotionStatus);

export default router;
