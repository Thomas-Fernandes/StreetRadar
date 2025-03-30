/**
 * MapContainer.tsx
 * 
 * Ce composant gère l'affichage et l'interaction avec la carte principale de StreetRadar.
 * Il utilise Leaflet pour afficher une carte interactive et superpose différentes couches 
 * de couverture de Street View provenant de divers fournisseurs. Le composant permet 
 * à l'utilisateur de basculer entre différentes couches et fonds de carte.
 * 
 * Fonctionnalités principales:
 * - Affichage d'une carte interactive avec choix de fond (OSM/Satellite)
 * - Visualisation des couvertures Street View (Google, etc.)
 * - Contrôles pour activer/désactiver les différentes couches
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { StreetViewService } from '@/services/streetViewService';

/**
 * Propriétés acceptées par le composant MapContainer
 */
interface MapContainerProps {
  center?: [number, number];
  zoom?: number;
}

/**
 * Composant principal de la carte qui affiche et gère l'interaction avec Leaflet
 */
export default function MapContainer({ center = [48.8566, 2.3522], zoom = 13 }: MapContainerProps) {
  // Référence au conteneur DOM de la carte
  const mapRef = useRef<HTMLDivElement>(null);
  // Instance de la carte Leaflet
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  // État des couches visibles
  const [visibleLayers, setVisibleLayers] = useState({
    googleStreetView: true,
    appleLookAround: false,
    bingStreetside: false,
  });

  // Initialisation de la carte Leaflet
  useEffect(() => {
    if (!mapRef.current) return;

    // Fix pour les icônes Leaflet
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/images/marker-icon-2x.png',
      iconUrl: '/images/marker-icon.png',
      shadowUrl: '/images/marker-shadow.png',
    });

    // Création de la carte
    const map = L.map(mapRef.current).setView(center, zoom);

    // Couche OSM de base
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Couche satellite alternative
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 19
    });

    // Configuration du contrôle de couches
    const baseMaps = {
      "OpenStreetMap": osm,
      "Satellite": satellite
    };
    L.control.layers(baseMaps, {}).addTo(map);
    L.control.scale().addTo(map);

    setMapInstance(map);

    // Nettoyage lors du démontage
    return () => {
      map.remove();
    };
  }, [center, zoom]);

  // Gestion des couches de Street View
  useEffect(() => {
    if (!mapInstance) return;
    
    const layers: L.TileLayer[] = [];
    
    // Ajout de la couche Google Street View si activée
    if (visibleLayers.googleStreetView) {
      const googleLayer = L.tileLayer(StreetViewService.getGoogleStreetViewTileUrl(), {
        maxZoom: 21,
        opacity: 0.9
      }).addTo(mapInstance);
      layers.push(googleLayer);
    }
    
    // Nettoyage des couches lors des changements
    return () => {
      layers.forEach(layer => {
        if (mapInstance.hasLayer(layer)) {
          mapInstance.removeLayer(layer);
        }
      });
    };
  }, [mapInstance, visibleLayers]);

  // Fonction pour basculer la visibilité d'une couche
  const toggleLayer = (layer: keyof typeof visibleLayers) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      {/* Conteneur de la carte */}
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      
      {/* Contrôle de couches */}
      {mapInstance && (
        <div className="layer-controls" style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '10px', 
          background: 'white', 
          padding: '10px', 
          borderRadius: '4px',
          zIndex: 1000 
        }}>
          <div>
            <input 
              type="checkbox" 
              id="google-layer" 
              checked={visibleLayers.googleStreetView} 
              onChange={() => toggleLayer('googleStreetView')} 
            />
            <label htmlFor="google-layer">Google Street View</label>
          </div>
          {/* Autres fournisseurs à ajouter ultérieurement */}
        </div>
      )}
    </div>
  );
}