/**
 * MapWrapper.tsx
 * 
 * This component serves as a wrapper for the main MapContainer component.
 * 
 * Its main role is to handle dynamic loading (lazy loading) of the map
 * to avoid errors related to Server-Side Rendering (SSR) with Leaflet.
 * Leaflet requires an environment with DOM access, which is not available
 * during server-side rendering in Next.js.
 * 
 * By using dynamic import, we ensure that the MapContainer component
 * is only loaded and rendered on the client side.
 */

'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR errors with Leaflet
// ssr: false -> Disables server-side rendering for this component
// loading -> Shows a placeholder while the component is loading
const MapContainer = dynamic(() => import('@/components/map/mapContainer'), { 
  ssr: false,
  loading: () => <div>Loading map...</div>
});

/**
 * Wrapper component that asynchronously loads the MapContainer
 * with initial coordinates centered on France
 */
export default function MapWrapper() {
  return (
    <div className="w-full h-full">
      <MapContainer center={[46.603354, 1.888334]} zoom={3} />
    </div>
  );
}