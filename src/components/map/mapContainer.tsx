'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapContainerProps {
  center?: [number, number];
  zoom?: number;
}

export default function MapContainer({ center = [48.8566, 2.3522], zoom = 13 }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);

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

    // Fournisseurs de streetview (exemple fictif pour l'instant)
    const googleStreetView = L.layerGroup();
    const appleStreetView = L.layerGroup();
    const bingStreetView = L.layerGroup();
    const mapillaryStreetView = L.layerGroup();

    // Ajouter quelques lignes d'exemple pour Google StreetView (en bleu)
    L.polyline([[48.8566, 2.3522], [48.86, 2.36]], { color: 'blue', weight: 5 }).addTo(googleStreetView);
    L.polyline([[48.87, 2.35], [48.87, 2.37]], { color: 'blue', weight: 5 }).addTo(googleStreetView);

    // Ajouter quelques lignes d'exemple pour Apple Look Around (en rouge)
    L.polyline([[48.85, 2.34], [48.84, 2.35]], { color: 'red', weight: 5 }).addTo(appleStreetView);
    
    // Ajouter quelques lignes d'exemple pour Bing Streetside (en vert)
    L.polyline([[48.86, 2.33], [48.85, 2.32]], { color: 'green', weight: 5 }).addTo(bingStreetView);
    
    // Ajouter quelques lignes d'exemple pour Mapillary (en jaune)
    L.polyline([[48.88, 2.35], [48.89, 2.36]], { color: 'orange', weight: 5 }).addTo(mapillaryStreetView);

    // Définir les couches superposées
    const overlayMaps = {
      "Google Street View": googleStreetView,
      "Apple Look Around": appleStreetView,
      "Bing Streetside": bingStreetView,
      "Mapillary": mapillaryStreetView
    };

    // Ajouter le contrôleur de couches
    L.control.layers(baseMaps, overlayMaps).addTo(map);

    // Ajouter l'échelle
    L.control.scale().addTo(map);

    // Activer par défaut la couche Google Street View
    googleStreetView.addTo(map);

    return () => {
      map.remove();
    };
  }, [center, zoom]);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}