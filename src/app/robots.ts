/**
 * robots.ts
 *
 * There was no robots.txt of our own — the one being served came from
 * Cloudflare's managed default. This replaces it with something that names the
 * sitemap, which is how a crawler finds it without being told.
 *
 * Nothing is disallowed: every route here is public and meant to be indexed.
 */

import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
