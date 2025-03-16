import ClientMap from '@/components/map/clientMap';

export const metadata = {
  title: 'StreetRadar - Carte interactive',
  description: 'Carte mondiale interactive des rues streetviewées',
};

export default function MapPage() {
  return (
    <main className="flex flex-col h-screen w-full">
      <div className="flex-1 w-full" style={{ height: "calc(100vh - 0px)" }}>
        <ClientMap />
      </div>
    </main>
  );
}