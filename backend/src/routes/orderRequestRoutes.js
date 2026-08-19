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

// Admin routes (protected)
router.use(protect);
router.use(authorizeRoles('admin', 'superadmin'));

router.post('/', validate(createOrderRequestSchema), createOrderRequest);
router.get('/', getOrderRequests);
router.get('/:id', getOrderRequestById);
router.patch('/:id/cancel', cancelOrderRequest);

// Public routes (no auth required)
const publicRouter = express.Router();
publicRouter.get('/public/:token', getPublicOrderRequest);
publicRouter.post('/public/:token/complete', validate(completeOrderRequestSchema), completeOrderRequest);

export { router as adminOrderRequestRoutes, publicRouter as publicOrderRequestRoutes };
