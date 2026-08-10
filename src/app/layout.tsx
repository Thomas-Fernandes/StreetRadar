/**
 * layout.tsx
 *
 * Main layout of the StreetRadar application.
 *
 * This file defines the base HTML structure that wraps all application pages.
 * It includes:
 * - Application metadata (title, description)
 * - Font imports
 * - Base HTML structure (html, body)
 * - Global CSS classes
 *
 * In Next.js, this layout is applied to all routes within the app/ directory.
 */

import type { Metadata } from 'next';
import { DM_Sans, Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

// Configuration of Geist fonts (sans-serif) and Geist Mono (monospace)
// These fonts will be available via CSS variables --font-geist-sans and --font-geist-mono
// Body font. It used to arrive through an @import of the Google Fonts CDN in
// globals.css — a render-blocking request to a third party on every page load,
// and one Turbopack rejects outright because @import must precede other rules.
// next/font self-hosts it and inlines the @font-face at build time.
const dmSans = DM_Sans({
    variable: '--font-dm-sans',
    subsets: ['latin'],
    weight: ['400', '500', '700'],
    display: 'swap',
});

// Still referenced by the chart components through --font-geist-sans.
const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    // metadataBase makes Next resolve opengraph-image and other assets to
    // absolute URLs. Without it they are emitted relative, and crawlers that
    // fetch the card out of context cannot follow them.
    metadataBase: new URL(SITE_URL),
    title: {
        default: 'StreetRadar — Street View Coverage Map',
        template: '%s — StreetRadar',
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    keywords: [
        'street view coverage',
        'street view coverage map',
        'apple look around coverage',
        'bing streetside coverage',
        'yandex panoramas coverage',
        'naver street view coverage',
        'já 360 coverage',
        'panorama coverage map',
    ],
    // No `alternates.canonical` here on purpose. Next propagates metadata from
    // the root layout to every page that does not override it, so a canonical
    // set at this level made /map and /analytics both emit
    // <link rel="canonical" href="https://streetradar.app">. Google treats that
    // as an instruction to fold those URLs into the home page and drop them from
    // the index — which is a large part of why it sent no traffic at all while
    // Bing, which treats canonical as a hint, kept indexing them.
    //
    // Each page declares its own canonical instead.
    openGraph: {
        type: 'website',
        siteName: SITE_NAME,
        title: 'StreetRadar — Street View Coverage Map',
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'StreetRadar — Street View Coverage Map',
        description: SITE_DESCRIPTION,
    },
    icons: {
        icon: '/images/logo_no_bg.png',
        shortcut: '/images/logo_no_bg.png',
        apple: '/images/logo_no_bg.png',
    },
};

/**
 * Root layout component that wraps all application pages
 */
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${dmSans.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
