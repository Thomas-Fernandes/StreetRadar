import type { NextConfig } from 'next';

/**
 * The config was empty, which meant no security headers at all.
 *
 * No Content-Security-Policy here on purpose: the map pulls tiles from six
 * providers plus two basemap hosts, and a policy written blind would break
 * layers silently in production. It belongs with the styling refactor, once the
 * full set of origins is pinned down and there is a preview to verify it on.
 */
const securityHeaders = [
    // The tile and panorama endpoints are unofficial and can be swapped for
    // lookalikes; stop the browser from second-guessing declared content types.
    { key: 'X-Content-Type-Options', value: 'nosniff' },

    // Nothing here is meant to be framed. Clickjacking a map that opens
    // provider deep links is a real, if small, risk.
    { key: 'X-Frame-Options', value: 'DENY' },

    // Send the origin to third parties rather than the full URL. Map URLs now
    // carry a precise location in the hash — fragments are never sent in a
    // Referer, but the path should not leak either.
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

    // Nothing on the site uses these.
    {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    },

    // Cloudflare already sends HSTS for the apex; setting it here keeps the
    // guarantee if the site is ever served from somewhere else.
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const nextConfig: NextConfig = {
    async headers() {
        return [{ source: '/:path*', headers: securityHeaders }];
    },

    images: {
        // Next 16 ships AVIF ahead of WebP. The map preview is already AVIF and
        // measured 78% smaller than the PNG it replaced.
        formats: ['image/avif', 'image/webp'],
    },
};

export default nextConfig;
