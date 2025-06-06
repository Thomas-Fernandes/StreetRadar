// src/app/map/page.tsx - Version mise à jour avec métadonnées

/**
 * map/page.tsx
 * 
 * Page principale de la carte interactive de StreetRadar.
 * 
 * Cette page affiche la carte en plein écran et permet aux utilisateurs
 * d'explorer la couverture des différents services de Street View.
 * Elle utilise le composant MapWrapper qui charge de manière dynamique
 * le composant de carte côté client pour éviter les problèmes de SSR.
 */

import MapWrapper from '@/components/map/mapWrapper';
import type { Metadata } from 'next';

// Métadonnées spécifiques à la page de carte
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
 * Composant de la page de carte qui occupe tout l'écran
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