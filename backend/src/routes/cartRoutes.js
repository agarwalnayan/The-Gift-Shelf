import express from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getCart);
router.post('/', addToCart);
router.patch('/', updateCartItem);
router.post('/coupon', applyCoupon);
router.delete('/coupon', removeCoupon);
router.delete('/:itemId', removeFromCart);
router.delete('/', clearCart);

export default router;