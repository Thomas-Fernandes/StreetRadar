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

// Métadonnées spécifiques à la page de carte
export const metadata = {
  title: 'StreetRadar - Carte interactive',
  description: 'Carte mondiale interactive des rues streetviewées',
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