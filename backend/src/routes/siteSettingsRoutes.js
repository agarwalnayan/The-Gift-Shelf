import express from 'express';

import {
    getSiteSettings,
    updateSiteSettings,
} from '../controllers/siteSettingsController.js';

import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getSiteSettings);

router.put(
    '/',
    protect,
    authorizeRoles('admin', 'superadmin'),
    updateSiteSettings
);

export default router;