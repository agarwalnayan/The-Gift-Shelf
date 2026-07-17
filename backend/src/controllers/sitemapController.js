import { create } from 'xmlbuilder2';
import Product from '../models/Product.js';

import env from '../config/env.js';

const BASE_URL = (env.siteUrl || env.clientUrl).replace(/\/$/, '');

const STATIC_PAGES = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/products', priority: '0.9', changefreq: 'daily' },
    { path: '/categories', priority: '0.9', changefreq: 'weekly' },
    { path: '/about', priority: '0.6', changefreq: 'monthly' },
    { path: '/contact', priority: '0.6', changefreq: 'monthly' },
    { path: '/privacy-policy', priority: '0.5', changefreq: 'yearly' },
    { path: '/shipping-policy', priority: '0.5', changefreq: 'yearly' },
    { path: '/returns', priority: '0.5', changefreq: 'yearly' },
];

export const getSitemap = async (req, res, next) => {
    try {
        const products = await Product.find({
            publishStatus: 'published',
            isActive: true,
            isDeleted: false,
        })
            .select('slug updatedAt')
            .lean();

        const root = create({
            version: '1.0',
            encoding: 'UTF-8',
        }).ele('urlset', {
            xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
        });

        // Static pages
        STATIC_PAGES.forEach((page) => {
            root
                .ele('url')
                .ele('loc')
                .txt(`${BASE_URL}${page.path}`)
                .up()
                .ele('changefreq')
                .txt(page.changefreq)
                .up()
                .ele('priority')
                .txt(page.priority)
                .up()
                .up();
        });

        // Products
        products.forEach((product) => {
            root
                .ele('url')
                .ele('loc')
                .txt(`${BASE_URL}/products/${product.slug}`)
                .up()
                .ele('lastmod')
                .txt(new Date(product.updatedAt).toISOString())
                .up()
                .ele('changefreq')
                .txt('weekly')
                .up()
                .ele('priority')
                .txt('0.8')
                .up()
                .up();
        });

        const xml = root.end({
            prettyPrint: true,
        });

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        next(error);
    }
};