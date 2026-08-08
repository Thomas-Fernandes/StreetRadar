/**
 * sitemap.ts
 *
 * The site had no sitemap at all — /sitemap.xml returned 404 — which is part of
 * why Google sends no traffic while Bing does. Three URLs is a small sitemap,
 * but it is the difference between "crawlable" and "invisible", and it is what
 * per-country pages will extend once the coverage data is fresh again.
 */

import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: SITE_URL,
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: `${SITE_URL}/map`,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/analytics`,
            changeFrequency: 'monthly',
            priority: 0.6,
        },
    ];
}
