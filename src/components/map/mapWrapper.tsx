'use client';

import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('@/components/map/mapContainer'), { ssr: false });

export default function MapWrapper() {
  return <MapContainer center={[48.8566, 2.3522]} zoom={13} />;
}