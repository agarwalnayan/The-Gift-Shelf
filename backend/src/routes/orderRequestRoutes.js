import express from 'express';
import {
  createOrderRequest,
  getOrderRequests,
  getOrderRequestById,
  cancelOrderRequest,
  getPublicOrderRequest,
  completeOrderRequest,
} from '../controllers/orderRequestController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { createOrderRequestSchema, completeOrderRequestSchema } from '../validations/orderRequestValidation.js';

const router = express.Router();

// Public routes (no auth required) - must come before admin routes
router.get('/public/:token', getPublicOrderRequest);
router.post('/public/:token/complete', validate(completeOrderRequestSchema), completeOrderRequest);

// Admin routes (protected)
router.use(protect);
router.use(authorizeRoles('admin', 'superadmin'));

router.post('/', validate(createOrderRequestSchema), createOrderRequest);
router.get('/', getOrderRequests);
router.get('/:id', getOrderRequestById);
router.patch('/:id/cancel', cancelOrderRequest);

export default router;
