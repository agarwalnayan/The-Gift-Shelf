import express from 'express';
import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  updateOrderTracking,
  deleteOrder,
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
router.patch('/:id/payment-status', authorizeRoles('admin', 'superadmin'), updatePaymentStatus);
router.patch('/:id/tracking', authorizeRoles('admin', 'superadmin'), updateOrderTracking);
router.delete('/:id', authorizeRoles('admin', 'superadmin'), deleteOrder);

export default router;