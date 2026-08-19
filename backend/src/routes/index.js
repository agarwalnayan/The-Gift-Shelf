import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import productRoutes from './productRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';
import marketingRoutes from './marketingRoutes.js';
import couponRoutes from './couponRoutes.js';
import siteSettingsRoutes from './siteSettingsRoutes.js';
import promotionRoutes from './promotionRoutes.js';
import badgeRoutes from './badgeRoutes.js';
import festivalRoutes from './festivalRoutes.js';
import statsRoutes from './statsRoutes.js';
import { adminOrderRequestRoutes, publicOrderRequestRoutes } from './orderRequestRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/order-requests', adminOrderRequestRoutes);
router.use('/order-requests', publicOrderRequestRoutes);
router.use('/marketing', marketingRoutes);
router.use('/coupons', couponRoutes);
router.use('/site-settings', siteSettingsRoutes);
router.use('/promotions', promotionRoutes);
router.use('/badges', badgeRoutes);
router.use('/festivals', festivalRoutes);
router.use('/stats', statsRoutes);

export default router;