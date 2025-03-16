'use client';

import dynamic from 'next/dynamic';

const ClientMap = dynamic(() => import('@/components/map/clientMap'), { ssr: false });

export default function MapWrapper() {
  return <ClientMap />;
}
