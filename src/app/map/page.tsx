/**
 * map/page.tsx
 *
 * Main page of StreetRadar's interactive map.
 *
 * This page displays the full-screen map and allows users
 * to explore coverage from different Street View services.
 * It uses the MapWrapper component which dynamically loads
 * the map component on the client side to avoid SSR issues.
 */

import Link from 'next/link';
import MapWrapper from '@/components/map/mapWrapper';
import JsonLd from '@/components/seo/jsonLd';
import type { Metadata } from 'next';
import { COVERAGE_UPDATED, PROVIDERS, SITE_NAME, SITE_URL, formatCoverageMonth } from '@/lib/site';

// Map page specific metadata
export const metadata: Metadata = {
    title: 'StreetRadar - Interactive Map',
    description:
        'Explore worldwide Street View coverage from Google, Bing, Yandex and Apple. Click anywhere to find available panoramas and discover street-level imagery around the world.',
    keywords:
        'street view, google maps, bing streetside, yandex panoramas, apple look around, coverage map, panoramas',
    alternates: { canonical: '/map' },
    openGraph: {
        title: 'StreetRadar - Interactive Street View Coverage Map',
        description:
            'Discover Street View coverage worldwide. Find panoramas from Google, Bing, Yandex and Apple in one place.',
        type: 'website',
    },
};

/**
 * Map page component that occupies the full screen
 */
export default function MapPage() {
    return (
        // The map sizes itself with an inline 100vh in MapContainer. These
        // wrappers carried Tailwind classes that never applied, because Tailwind
        // was never imported; leaving them in place while switching it on would
        // introduce a second, competing sizing mechanism. Converting this page
        // properly is a separate change.
        <main>
            {/* Until now this page server-rendered six words — the string
                "Loading map..." inside mapWrapper's dynamic() fallback — and no
                heading at all, because the map is client-only. That is the whole
                indexable surface a crawler ever saw. The heading is visually
                hidden because the map fills the viewport and there is nowhere to
                put it, but it is the page's real subject, not keyword filler:
                the prose below says the same thing at length. */}
            <h1 className="sr-only">Street View coverage map</h1>

            <div>
                <MapWrapper />
            </div>

            <section className="bg-background py-16">
                <div className="container">
                    <h2 className="text-ink mb-5 text-2xl font-semibold">What this map shows</h2>
                    <p className="text-ink-light mb-10 max-w-[70ch] leading-[1.6]">
                        Every provider publishes street-level imagery for a different part of the
                        world, and none of them will tell you where the others have been. This map
                        puts all six coverage networks in one place, so you can see at a glance
                        whether a given road has been photographed — and by whom. Click anywhere to
                        check which providers have a panorama near that point, then open it directly
                        in the provider’s own viewer.
                    </p>

                    <h2 className="text-ink mb-5 text-2xl font-semibold">The six providers</h2>
                    <dl className="mb-10 grid max-w-[70ch] gap-5">
                        {PROVIDERS.map((provider) => (
                            <div key={provider.id}>
                                <dt className="text-ink font-medium">{provider.name}</dt>
                                <dd className="text-ink-light leading-[1.6]">
                                    {provider.blurb}{' '}
                                    {provider.source === 'live' ? (
                                        <span>
                                            This layer is requested live as you pan, so it is always
                                            current.
                                        </span>
                                    ) : (
                                        <span>
                                            This layer is built from coverage collected for this
                                            site, last rebuilt in{' '}
                                            {formatCoverageMonth(COVERAGE_UPDATED[provider.id])}.
                                        </span>
                                    )}
                                </dd>
                            </div>
                        ))}
                    </dl>

                    <p className="text-ink-light">
                        Curious how coverage has grown over time?{' '}
                        <Link href="/analytics" className="text-primary underline">
                            See the coverage statistics
                        </Link>
                        , or read more{' '}
                        <Link href="/" className="text-primary underline">
                            about StreetRadar
                        </Link>
                        .
                    </p>
                </div>
            </section>

            <JsonLd
                data={{
                    '@context': 'https://schema.org',
                    '@type': 'WebApplication',
                    name: `${SITE_NAME} coverage map`,
                    url: `${SITE_URL}/map`,
                    applicationCategory: 'BrowserApplication',
                    operatingSystem: 'Any',
                    browserRequirements: 'Requires JavaScript.',
                    description:
                        'Interactive map of worldwide street-level imagery coverage from ' +
                        'Google Street View, Apple Look Around, Bing Streetside, Yandex ' +
                        'Panoramas, Naver Street View and Já 360.',
                    isAccessibleForFree: true,
                    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
                }}
            />
        </main>
    );
}
