import express from 'express';
import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.post('/verify-payment', verifyPayment);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);

router.get('/', authorizeRoles('admin', 'superadmin'), getAllOrders);
router.patch('/:id/status', authorizeRoles('admin', 'superadmin'), updateOrderStatus);

export default router;
