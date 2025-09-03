/**
 * StreetViewLayer.tsx
 * 
 * React component to manage the display of Street View coverage layers on the map.
 * 
 * This component is responsible for adding and removing tile layers
 * representing Street View coverage from different providers (Google, Apple, etc.)
 * on the Leaflet map. It manages layer visibility state and handles cleaning up
 * resources when properties change or when the component is unmounted.
 * 
 * It has no visual rendering of its own (returns null) as it directly manipulates
 * the Leaflet map instance through its effects.
 */

'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import { StreetViewService } from '@/services/streetViewService';
import { createBingTileLayer } from './bingTileLayer';
import { createYandexTileLayer } from './yandexTileLayer';
import { createAppleMVTLayer } from './appleMVTLayer';
import { createNaverMVTLayer } from './naverMVTLayer';

/**
 * Properties for the StreetViewLayer component
 * @property map - The Leaflet map instance
 * @property provider - The Street View provider to display
 * @property visible - Whether the layer should be visible or not
 */
interface StreetViewLayerProps {
  map: L.Map | null;
  provider: 'google' | 'apple' | 'bing' | 'yandex' | 'naver';
  visible: boolean;
}

/**
 * Gets the appropriate attribution for each provider
 * @param provider - The Street View provider
 * @returns The HTML attribution string
 */
const getAttribution = (provider: string): string => {
  switch (provider) {
    case 'google':
      return '&copy; <a href="https://www.google.com/streetview/" target="_blank" rel="noopener noreferrer">Google Street View</a>';
    case 'bing':
      return '&copy; <a href="https://www.bing.com/maps/streetside" target="_blank" rel="noopener noreferrer">Microsoft Bing Streetside</a>';
    case 'yandex':
      return '&copy; <a href="https://yandex.com/maps/" target="_blank" rel="noopener noreferrer">Yandex Panoramas</a>';
    case 'apple':
      return '&copy; <a href="https://maps.apple.com" target="_blank" rel="noopener noreferrer">Apple Look Around</a>';
    case 'naver':
      return '&copy; <a href="https://map.naver.com" target="_blank" rel="noopener noreferrer">Naver Street View</a>';
    default:
      return '';
  }
};

/**
 * Component that adds a tile layer representing Street View coverage
 * from a specific provider to the Leaflet map.
 */
const StreetViewLayer: React.FC<StreetViewLayerProps> = ({ map, provider, visible }) => {
  useEffect(() => {
    // Do nothing if the map is not initialized
    if (!map) return;

    // Variable to store the reference to the created layer
    let tileLayer: L.TileLayer | L.GridLayer | null = null;
    
    // Get attribution for this provider
    const attribution = getAttribution(provider);

    // Select appropriate URL based on provider
    if (visible) {
      switch (provider) {
        case 'google':
          tileLayer = L.tileLayer(StreetViewService.getGoogleStreetViewTileUrl(), {
            maxZoom: 19,
            opacity: 0.9,
            pane: 'overlayPane',
            attribution: attribution
          });
          break;
        case 'bing':
          // Use our custom TileLayer for Bing that handles quadkeys
          tileLayer = createBingTileLayer(StreetViewService.getBingStreetsideTileUrl(), {
            maxZoom: 19,
            opacity: 0.9,
            pane: 'overlayPane',
            attribution: attribution
          });
          break;
        case 'yandex':
          tileLayer = createYandexTileLayer(StreetViewService.getYandexPanoramasTileUrl(), {
            maxZoom: 19,
            opacity: 0.9,
            pane: 'overlayPane',
            attribution: attribution
          });
          break;
        case 'apple':
          // Use custom MVT layer for Apple
          const appleUrl = StreetViewService.getAppleLookAroundTileUrl();
          if (appleUrl === 'APPLE_MVT_LAYER') {
            tileLayer = createAppleMVTLayer({
              opacity: 0.9,
              pane: 'overlayPane',
              attribution: attribution,
              style: {
                color: '#e74c3c',
                weight: 2,
                opacity: 0.8
              }
            });
          }
          break;
        case 'naver':
          // Use custom MVT layer for Naver
          const naverUrl = StreetViewService.getNaverStreetViewTileUrl();
          if (naverUrl === 'NAVER_MVT_LAYER') {
            tileLayer = createNaverMVTLayer({
              opacity: 0.9,
              pane: 'overlayPane',
              attribution: attribution,
              style: {
                color: '#00c851',
                weight: 2,
                opacity: 0.8
              }
            });
          }
          break;
      }
      
      // Add layer to map if it was created
      if (tileLayer) {
        tileLayer.addTo(map);
      }
    }

    // Cleanup function executed on unmount or dependency changes
    return () => {
      // Remove layer from map if it exists
      if (tileLayer && map.hasLayer(tileLayer)) {
        map.removeLayer(tileLayer);
      }
    };
  }, [map, provider, visible]); // Effect dependencies

  // This component renders nothing directly in the DOM
  return null;
};

export default StreetViewLayer;