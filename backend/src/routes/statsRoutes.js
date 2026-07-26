import express from 'express';
import { getDashboardStats } from '../controllers/statsController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, authorizeRoles('admin', 'superadmin'), getDashboardStats);

export default router;