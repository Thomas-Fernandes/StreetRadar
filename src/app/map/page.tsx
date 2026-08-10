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

import MapWrapper from '@/components/map/mapWrapper';
import type { Metadata } from 'next';

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
            <div>
                <MapWrapper />
            </div>
        </main>
    );
}
