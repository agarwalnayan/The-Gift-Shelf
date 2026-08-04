import express from 'express';
import { protect, authorizeRoles, attachUserIfPresent } from '../middleware/authMiddleware.js';
import {
  createBadge,
  getBadges,
  getBadgeById,
  updateBadge,
  updateBadgeStatus,
  deleteBadge,
  getActiveBadges,
} from '../controllers/badgeController.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  createBadgeSchema,
  updateBadgeSchema,
  badgeStatusSchema,
} from '../validations/badgeValidation.js';

const router = express.Router();

// Public route for fetching active badges
router.get('/active', attachUserIfPresent, getActiveBadges);

// Admin-only routes
router.use(protect, authorizeRoles('admin', 'superadmin'));

router.get('/', getBadges);
router.get('/:id', getBadgeById);
router.post('/', validate(createBadgeSchema), createBadge);
router.put('/:id', validate(updateBadgeSchema), updateBadge);
router.patch('/:id/status', validate(badgeStatusSchema), updateBadgeStatus);
router.delete('/:id', deleteBadge);

export default router;
