/**
 * StreetViewLayer.tsx
 * 
 * Composant React pour gérer l'affichage des couches de couverture Street View sur la carte.
 * 
 * Ce composant est responsable de l'ajout et la suppression des couches de tuiles
 * représentant la couverture Street View des différents fournisseurs (Google, Apple, etc.)
 * sur la carte Leaflet. Il gère l'état de visibilité des couches et s'occupe de nettoyer
 * les ressources lorsque les propriétés changent ou que le composant est démonté.
 * 
 * Il n'a pas de rendu visuel propre (retourne null) car il manipule directement
 * l'instance de carte Leaflet via ses effets.
 */

'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import { StreetViewService } from '@/services/streetViewService';
import { createBingTileLayer } from './bingTileLayer';
import { createYandexTileLayer } from './yandexTileLayer';
import { createAppleMVTLayer } from './appleMVTLayer';

/**
 * Propriétés pour le composant StreetViewLayer
 * @property map - L'instance de la carte Leaflet
 * @property provider - Le fournisseur de Street View à afficher
 * @property visible - Si la couche doit être visible ou non
 */
interface StreetViewLayerProps {
  map: L.Map | null;
  provider: 'google' | 'apple' | 'bing' | 'yandex';
  visible: boolean;
}

/**
 * Obtient l'attribution appropriée pour chaque fournisseur
 * @param provider - Le fournisseur de Street View
 * @returns La chaîne d'attribution HTML
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
    default:
      return '';
  }
};

/**
 * Composant qui ajoute une couche de tuiles représentant la couverture Street View
 * d'un fournisseur spécifique à la carte Leaflet.
 */
const StreetViewLayer: React.FC<StreetViewLayerProps> = ({ map, provider, visible }) => {
  useEffect(() => {
    // Ne rien faire si la carte n'est pas initialisée
    if (!map) return;

    // Variable pour stocker la référence à la couche créée
    let tileLayer: L.TileLayer | L.GridLayer | null = null;
    
    // Obtenir l'attribution pour ce fournisseur
    const attribution = getAttribution(provider);

    // Sélectionner l'URL appropriée selon le fournisseur
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
          // Utiliser notre TileLayer personnalisé pour Bing qui gère les quadkeys
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
          // Utiliser le layer MVT personnalisé pour Apple
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
      }
      
      // Ajouter la couche à la carte si elle a été créée
      if (tileLayer) {
        tileLayer.addTo(map);
      }
    }

    // Fonction de nettoyage exécutée lors du démontage ou changement des dépendances
    return () => {
      // Supprimer la couche de la carte si elle existe
      if (tileLayer && map.hasLayer(tileLayer)) {
        map.removeLayer(tileLayer);
      }
    };
  }, [map, provider, visible]); // Dépendances de l'effet

  // Ce composant ne rend rien directement dans le DOM
  return null;
};

export default StreetViewLayer;