import express from 'express';
import { createCoupon, getCoupons, updateCoupon, deleteCoupon, validateCoupon } from '../controllers/couponController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorizeRoles('admin', 'superadmin'));

router.get('/', getCoupons);
router.post('/', createCoupon);
router.post('/validate', validateCoupon);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

export default router;