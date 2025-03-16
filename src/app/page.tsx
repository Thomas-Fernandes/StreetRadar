import Link from 'next/link';
import MapWrapper from '@/components/map/mapWrapper';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Tier supérieur : titre */}
      <div className="flex items-center justify-center h-1/3 bg-gray-200">
        <h1 className="text-5xl font-bold">StreetRadar</h1>
      </div>
      {/* Deux tiers inférieurs : aperçu de la carte */}
      <div className="flex items-center justify-center h-2/3">
        <Link href="/map">
          <div className="w-full max-w-4xl h-full border border-gray-300 rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-shadow">
            <MapWrapper />
          </div>
        </Link>
      </div>
    </div>
  );
}
