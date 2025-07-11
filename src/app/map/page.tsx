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
  description: 'Explore worldwide Street View coverage from Google, Bing, Yandex and Apple. Click anywhere to find available panoramas and discover street-level imagery around the world.',
  keywords: 'street view, google maps, bing streetside, yandex panoramas, apple look around, coverage map, panoramas',
  openGraph: {
    title: 'StreetRadar - Interactive Street View Coverage Map',
    description: 'Discover Street View coverage worldwide. Find panoramas from Google, Bing, Yandex and Apple in one place.',
    type: 'website',
  },
};

/**
 * Map page component that occupies the full screen
 */
export default function MapPage() {
  return (
    <main className="flex flex-col h-screen w-full">
      <div className="flex-1 w-full">
        <MapWrapper />
      </div>
    </main>
  );
}