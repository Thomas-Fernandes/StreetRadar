// src/components/map/streetViewLayer.tsx
'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import { StreetViewService } from '@/services/streetViewService';

interface StreetViewLayerProps {
  map: L.Map | null;
  provider: 'google' | 'apple' | 'bing' | 'mapillary';
  visible: boolean;
}

const StreetViewLayer: React.FC<StreetViewLayerProps> = ({ map, provider, visible }) => {
  useEffect(() => {
    if (!map) return;

    // Créer une couche de tuiles pour le fournisseur spécifié
    let tileLayer: L.TileLayer | null = null;

    switch (provider) {
      case 'google':
        tileLayer = L.tileLayer(StreetViewService.getGoogleStreetViewTileUrl(), {
          maxZoom: 21,
          opacity: 0.9,
          pane: 'overlayPane',
        });
        break;
      case 'apple':
        // Placeholder pour l'implémentation future d'Apple Look Around
        break;
      case 'bing':
        // Placeholder pour l'implémentation future de Bing Streetside
        break;
      case 'mapillary':
        // Placeholder pour l'implémentation future de Mapillary
        break;
    }

    // Ajouter la couche si elle est visible
    if (tileLayer && visible) {
      tileLayer.addTo(map);
    }

    // Nettoyer lors du démontage
    return () => {
      if (tileLayer && map.hasLayer(tileLayer)) {
        map.removeLayer(tileLayer);
      }
    };
  }, [map, provider, visible]);

  // Ce composant ne rend rien directement dans le DOM
  return null;
};

export default StreetViewLayer;