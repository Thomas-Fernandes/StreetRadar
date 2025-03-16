// src/components/map/mapWrapper.tsx
'use client';

import dynamic from 'next/dynamic';

// Import dynamique pour éviter les erreurs de SSR avec Leaflet
const MapContainer = dynamic(() => import('@/components/map/mapContainer'), { 
  ssr: false,
  loading: () => <div>Chargement de la carte...</div>
});

export default function MapWrapper() {
  return (
    <div className="w-full h-full">
      <MapContainer center={[48.8566, 2.3522]} zoom={13} />
    </div>
  );
}