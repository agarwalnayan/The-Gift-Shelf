import express from 'express';
import { getSitemap } from '../controllers/sitemapController.js';

const router = express.Router();

router.get('/sitemap.xml', getSitemap);

export default router;