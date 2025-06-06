/**
 * MapWrapper.tsx
 * 
 * Ce composant sert de wrapper pour le composant MapContainer principal.
 * 
 * Son rôle principal est de gérer le chargement dynamique (lazy loading) de la carte
 * afin d'éviter les erreurs liées au Server-Side Rendering (SSR) avec Leaflet.
 * Leaflet nécessite un environnement avec accès au DOM, qui n'est pas disponible
 * lors du rendu côté serveur dans Next.js.
 * 
 * En utilisant dynamic import, nous nous assurons que le composant MapContainer
 * n'est chargé et rendu que côté client.
 */

'use client';

import dynamic from 'next/dynamic';

// Import dynamique pour éviter les erreurs de SSR avec Leaflet
// ssr: false -> Désactive le rendu côté serveur pour ce composant
// loading -> Affiche un placeholder pendant le chargement du composant
const MapContainer = dynamic(() => import('@/components/map/mapContainer'), { 
  ssr: false,
  loading: () => <div>Loading map...</div>
});

/**
 * Composant wrapper qui charge de façon asynchrone le MapContainer
 * avec des coordonnées initiales centrées sur la France
 */
export default function MapWrapper() {
  return (
    <div className="w-full h-full">
      <MapContainer center={[46.603354, 1.888334]} zoom={3} />
    </div>
  );
}