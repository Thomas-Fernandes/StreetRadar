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

/**
 * Propriétés pour le composant StreetViewLayer
 * @property map - L'instance de la carte Leaflet
 * @property provider - Le fournisseur de Street View à afficher
 * @property visible - Si la couche doit être visible ou non
 */
interface StreetViewLayerProps {
  map: L.Map | null;
  provider: 'google' | 'apple' | 'bing';
  visible: boolean;
}

/**
 * Composant qui ajoute une couche de tuiles représentant la couverture Street View
 * d'un fournisseur spécifique à la carte Leaflet.
 */
const StreetViewLayer: React.FC<StreetViewLayerProps> = ({ map, provider, visible }) => {
  useEffect(() => {
    // Ne rien faire si la carte n'est pas initialisée
    if (!map) return;

    // Variable pour stocker la référence à la couche créée
    let tileLayer: L.TileLayer | null = null;

    // Sélectionner l'URL appropriée selon le fournisseur
    if (visible) {
      switch (provider) {
        case 'google':
          tileLayer = L.tileLayer(StreetViewService.getGoogleStreetViewTileUrl(), {
            maxZoom: 21,
            opacity: 0.9,
            pane: 'overlayPane',
          });
          break;
        case 'bing':
          // Utiliser notre TileLayer personnalisé pour Bing qui gère les quadkeys
          tileLayer = createBingTileLayer(StreetViewService.getBingStreetsideTileUrl(), {
            maxZoom: 21,
            opacity: 0.9,
            pane: 'overlayPane',
          });
          break;
        case 'apple':
          // Implémentation future pour Apple Look Around
          const appleUrl = StreetViewService.getAppleLookAroundTileUrl();
          if (appleUrl) {
            tileLayer = L.tileLayer(appleUrl, {
              maxZoom: 21,
              opacity: 0.9,
              pane: 'overlayPane',
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