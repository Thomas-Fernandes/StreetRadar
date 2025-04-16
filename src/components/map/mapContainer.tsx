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
 * - Bouton Home pour revenir à la page d'accueil
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import StreetViewLayer from '@/services/streetViewLayer';

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
export default function MapContainer({ center = [46.603354, 1.888334], zoom = 3 }: MapContainerProps) {
  // Référence au conteneur DOM de la carte
  const mapRef = useRef<HTMLDivElement>(null);
  // Instance de la carte Leaflet
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  // État des couches visibles
  const [visibleLayers, setVisibleLayers] = useState({
    googleStreetView: true,
    bingStreetside: true,
    yandexPanoramas: false,
    appleLookAround: false,
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
    const map = L.map(mapRef.current, {
      maxZoom: 19,
      zoomControl: false  // Désactiver le contrôle de zoom par défaut pour le repositionner
    }).setView(center, zoom);

    // Ajouter le contrôle de zoom à une position spécifique
    L.control.zoom({
      position: 'topleft'
    }).addTo(map);

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

    // Ajouter le bouton Home (personnalisé) au-dessus du zoom
    const homeButton = L.Control.extend({
      options: {
        position: 'topleft'
      },
      onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const button = L.DomUtil.create('a', 'home-button', container);
        
        button.innerHTML = '🏠';
        button.title = 'Retour à l\'accueil';
        button.href = '/';  // Lien vers la page d'accueil
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.width = '30px';
        button.style.height = '30px';
        button.style.fontSize = '18px';
        button.style.textDecoration = 'none';
        
        return container;
      }
    });
    
    map.addControl(new homeButton());

    setMapInstance(map);

    // Nettoyage lors du démontage
    return () => {
      map.remove();
    };
  }, [center, zoom]);

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
          zIndex: 1000,
          boxShadow: '0 1px 5px rgba(0,0,0,0.2)'
        }}>
          <div className="control-header" style={{ marginBottom: '8px', fontWeight: 'bold' }}>
            Couches de Street View
          </div>
          <div>
            <input 
              type="checkbox" 
              id="google-layer" 
              checked={visibleLayers.googleStreetView} 
              onChange={() => toggleLayer('googleStreetView')} 
            />
            <label htmlFor="google-layer" style={{ marginLeft: '5px', color: '#4285F4' }}>Google Street View</label>
          </div>
          <div style={{ marginTop: '8px' }}>
            <input 
              type="checkbox" 
              id="bing-layer" 
              checked={visibleLayers.bingStreetside} 
              onChange={() => toggleLayer('bingStreetside')} 
            />
            <label htmlFor="bing-layer" style={{ marginLeft: '5px', color: '#8661C5' }}>Bing Streetside</label>
          </div>
          <div style={{ marginTop: '8px' }}>
            <input 
              type="checkbox" 
              id="yandex-layer" 
              checked={visibleLayers.yandexPanoramas} 
              onChange={() => toggleLayer('yandexPanoramas')} 
            />
            <label htmlFor="yandex-layer" style={{ marginLeft: '5px', color: '#FF0000' }}>Yandex Panoramas</label>
          </div>
        </div>
      )}

      {/* Composants pour les couches Street View */}
      {mapInstance && (
        <>
          <StreetViewLayer 
            map={mapInstance} 
            provider="google" 
            visible={visibleLayers.googleStreetView} 
          />
          <StreetViewLayer 
            map={mapInstance} 
            provider="bing" 
            visible={visibleLayers.bingStreetside} 
          />
          <StreetViewLayer 
            map={mapInstance} 
            provider="yandex" 
            visible={visibleLayers.yandexPanoramas} 
          />
        </>
      )}
    </div>
  );
}