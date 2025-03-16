// src/components/map/mapContainer.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { StreetViewService } from '@/services/streetViewService';

interface MapContainerProps {
  center?: [number, number];
  zoom?: number;
}

export default function MapContainer({ center = [48.8566, 2.3522], zoom = 13 }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [visibleLayers, setVisibleLayers] = useState({
    googleStreetView: true,
    appleLookAround: false,
    bingStreetside: false,
    mapillary: false,
  });

  // Effet pour l'initialisation de la carte
  useEffect(() => {
    if (!mapRef.current) return;

    console.log("Initializing map...");

    // Fix pour les icônes Leaflet
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/images/marker-icon-2x.png',
      iconUrl: '/images/marker-icon.png',
      shadowUrl: '/images/marker-shadow.png',
    });

    // Initialiser la carte
    const map = L.map(mapRef.current).setView(center, zoom);

    // Ajouter la couche OSM de base
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Ajouter la couche satellite comme option
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 19
    });

    // Définir les couches de base
    const baseMaps = {
      "OpenStreetMap": osm,
      "Satellite": satellite
    };

    // Définir les contrôles de couches
    L.control.layers(baseMaps, {}).addTo(map);

    // Ajouter l'échelle
    L.control.scale().addTo(map);

    // Stocker l'instance de carte
    setMapInstance(map);

    return () => {
      map.remove();
    };
  }, [center, zoom]);

  // Effet pour gérer les couches de Street View
  useEffect(() => {
    if (!mapInstance) return;
    
    // Référence aux couches pour pouvoir les supprimer plus tard
    const layers: L.TileLayer[] = [];
    
    // Ajouter les couches selon leur visibilité
    if (visibleLayers.googleStreetView) {
      const googleLayer = L.tileLayer(StreetViewService.getGoogleStreetViewTileUrl(), {
        maxZoom: 21,
        opacity: 0.9
      }).addTo(mapInstance);
      layers.push(googleLayer);
    }
    
    // Autres fournisseurs à implémenter...
    
    // Nettoyage lors du changement de dépendances
    return () => {
      layers.forEach(layer => {
        if (mapInstance.hasLayer(layer)) {
          mapInstance.removeLayer(layer);
        }
      });
    };
  }, [mapInstance, visibleLayers]);

  // Fonction pour basculer la visibilité des couches
  const toggleLayer = (layer: keyof typeof visibleLayers) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      
      {/* Contrôle de couches simplifié */}
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