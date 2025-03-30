/**
 * page.tsx
 * 
 * Page d'accueil principale de l'application StreetRadar.
 * 
 * Cette page sert de point d'entrée pour les utilisateurs et présente une vue d'ensemble
 * de l'application avec un aperçu de la carte qui sert de lien vers la page de carte complète.
 * La page est divisée en deux sections : un titre en haut et un aperçu de la carte en dessous.
 */

import Link from 'next/link';
import MapWrapper from '@/components/map/mapWrapper';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Tier supérieur : titre de l'application */}
      <div className="flex items-center justify-center h-1/3 bg-gray-200">
        <h1 className="text-5xl font-bold">StreetRadar</h1>
      </div>
      {/* Deux tiers inférieurs : aperçu de la carte cliquable */}
      <div className="flex items-center justify-center h-2/3">
        <Link href="/map">
          <div className="w-full max-w-4xl h-full border border-gray-300 rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-shadow">
            {/* L'aperçu de la carte est un lien vers la page de carte complète */}
            <MapWrapper />
          </div>
        </Link>
      </div>
    </div>
  );
}