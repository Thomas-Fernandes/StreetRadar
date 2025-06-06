/**
 * MapContainer.tsx
 * 
 * This component manages the display and interaction with StreetRadar's main map.
 * It uses Leaflet to display an interactive map and overlays various Street View
 * coverage layers from different providers.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@/styles/leafletStyles.css'; // Import our custom styles
import StreetViewLayer from '@/services/streetViewLayer';
import PegcatControl from './pegcatControl'; // Import du nouveau contrôle PegCat
import { PanoramaService } from '../../services/panoramaService';
import { StreetViewDetectionResult } from '@/services/streetViewDetectionCanvas';
import PanoramaBubble from '@/components/map/panoramaBubble';

/**
 * Props accepted by the MapContainer component
 */
interface MapContainerProps {
  center?: [number, number];
  zoom?: number;
}

/**
 * Main map component that displays and manages interaction with Leaflet
 */
export default function MapContainer({ center = [46.603354, 1.888334], zoom = 3 }: MapContainerProps) {
  // Reference to the map's DOM container
  const mapRef = useRef<HTMLDivElement>(null);
  // Leaflet map instance
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  // Visible layers state
  const [visibleLayers, setVisibleLayers] = useState({
    googleStreetView: true,
    bingStreetside: true,
    yandexPanoramas: false,
    appleLookAround: false,
  });
  // Control panel collapsed state
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  // Basemap selection
  const [currentBasemap, setCurrentBasemap] = useState('osm');
  // Basemap selector open state
  const [isBasemapSelectorOpen, setIsBasemapSelectorOpen] = useState(false);
  // References to the basemap layers
  const basemapLayersRef = useRef<{[key: string]: L.TileLayer}>({});
  // État pour savoir si la carte est clickable pour Street View
  const [mapClickable, setMapClickable] = useState<boolean>(false);
  // Information sur le dernier clic/drop
  const [clickInfo, setClickInfo] = useState<{
    position: L.LatLng | null;
    type: 'click' | 'drop';
    timestamp: number;
  } | null>(null);
  // Résultats de détection des panoramas
  const [detectionResults, setDetectionResults] = useState<StreetViewDetectionResult[]>([]);
  // Position détectée pour afficher la bulle
  const [detectedPosition, setDetectedPosition] = useState<L.LatLng | null>(null);
  // État indiquant si une détection est en cours
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  
  // Niveau de zoom minimum pour activer Street View
  const MIN_ZOOM_FOR_STREETVIEW = 12;

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current) return;

    // Fix for Leaflet icons
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/images/marker-icon-2x.png',
      iconUrl: '/images/marker-icon.png',
      shadowUrl: '/images/marker-shadow.png',
    });

    // Create map with streetradar-map class for our custom CSS
    const map = L.map(mapRef.current, {
      maxZoom: 19,
      zoomControl: false,  // Disable default zoom control to reposition it
    }).setView(center, zoom);
    
    // Add our custom CSS class to the map container
    map.getContainer().className += ' streetradar-map';

    // OSM base layer
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Alternative satellite layer
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 19
    });

    // CARTO Voyager layer
    const carto = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    });

    // Store references to basemap layers
    basemapLayersRef.current = {
      osm,
      satellite,
      carto
    };

    // Add home button (custom) above zoom
    const HomeButtonControl = L.Control.extend({
      options: {
        position: 'topleft'
      },
      onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control home-control');
        const button = L.DomUtil.create('a', 'home-button', container);
        
        button.innerHTML = '🏠';
        button.title = 'Back to home';
        button.href = '/';  // Link to home page
        
        return container;
      }
    });
    
    map.addControl(new HomeButtonControl());  // Home button first
    L.control.zoom({                          // Zoom control second
      position: 'topleft'
    }).addTo(map);

    // No scale control as requested

    setMapInstance(map);

    // Cleanup on unmount
    return () => {
      map.remove();
    };
  }, [center, zoom]);

  // Ajout de l'effet pour gérer le curseur de la carte selon le niveau de zoom
  useEffect(() => {
    if (!mapInstance) return;
    
    const handleZoom = () => {
      const currentZoom = mapInstance.getZoom();
      if (currentZoom >= MIN_ZOOM_FOR_STREETVIEW) {
        mapInstance.getContainer().classList.add('map-clickable');
        setMapClickable(true);
      } else {
        mapInstance.getContainer().classList.remove('map-clickable');
        setMapClickable(false);
      }
    };
    
    mapInstance.on('zoomend', handleZoom);
    // Initialiser au chargement
    handleZoom();
    
    return () => {
      mapInstance.off('zoomend', handleZoom);
    };
  }, [mapInstance]);

  // Effet pour faire disparaître la bulle d'info après un délai
  useEffect(() => {
    if (!clickInfo) return;
    
    const timer = setTimeout(() => {
      setClickInfo(null);
    }, 5000); // 5 secondes
    
    return () => clearTimeout(timer);
  }, [clickInfo]);

  // Function to toggle layer visibility
  const toggleLayer = (layer: keyof typeof visibleLayers) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  // Handle checkbox click without propagation to parent
  const handleCheckboxClick = (
    e: React.MouseEvent<HTMLInputElement>, 
    layer: keyof typeof visibleLayers
  ) => {
    e.stopPropagation(); // Stop propagation to prevent double toggle
    toggleLayer(layer);
  };

  // Toggle panel collapsed state
  const togglePanel = () => {
    setIsPanelCollapsed(!isPanelCollapsed);
  };

  // Function to change basemap
  const changeBasemap = (basemap: string) => {
    if (!mapInstance || !basemapLayersRef.current) return;
    
    // Remove all basemap layers
    Object.values(basemapLayersRef.current).forEach(layer => {
      if (mapInstance.hasLayer(layer)) {
        mapInstance.removeLayer(layer);
      }
    });
    
    // Add the selected basemap (unless "none" is selected)
    if (basemap !== 'none' && basemapLayersRef.current[basemap]) {
      basemapLayersRef.current[basemap].addTo(mapInstance);
    }
    
    // Set the background color for "none" option
    if (basemap === 'none' && mapRef.current) {
      mapRef.current.style.backgroundColor = '#f8f9fa'; // Light gray background
    } else if (mapRef.current) {
      mapRef.current.style.backgroundColor = ''; // Reset background
    }
    
    // Update current basemap state
    setCurrentBasemap(basemap);
    
    // Close the selector after selection
    setIsBasemapSelectorOpen(false);
  };

  // Toggle basemap selector
  const toggleBasemapSelector = () => {
    setIsBasemapSelectorOpen(!isBasemapSelectorOpen);
  };

  /**
   * Gère l'événement de dépôt du PegCat sur la carte
   */
  const handlePegcatDrop = async (latlng: L.LatLng) => {
    console.log('PegCat dropped at:', latlng);
    
    // Commencer la détection
    await detectPanoramas(latlng, 'drop');
  };

  /**
   * Gère le clic sur la carte quand le zoom est suffisant
   */
  const handleMapClick = async (latlng: L.LatLng) => {
    console.log('Map clicked at:', latlng);
    
    // Commencer la détection
    await detectPanoramas(latlng, 'click');
  };

  /**
   * Fonction commune pour détecter les panoramas
   */
  const detectPanoramas = async (latlng: L.LatLng, type: 'click' | 'drop') => {
    if (!mapInstance) return;
    
    // Afficher une indication que la détection est en cours
    setClickInfo({
      position: latlng,
      type,
      timestamp: Date.now()
    });
    
    // Marquer qu'on est en train de détecter
    setIsDetecting(true);
    
    try {
      // Récupérer la liste des fournisseurs actifs
      const activeProviders = Object.entries(visibleLayers)
        .filter(([_, isVisible]) => isVisible)
        .map(([provider]) => provider.replace('StreetView', '').replace('Streetside', '').replace('Panoramas', '').replace('LookAround', '').toLowerCase());
      
      // Détecter les panoramas disponibles
      const results = await PanoramaService.detectPanoramasAt(
        mapInstance,
        latlng,
        activeProviders,
        { method: 'canvas' }
      );
      
      console.log('Détection terminée:', results);
      
      // Stocker les résultats
      setDetectionResults(results);
      
      // Trouver le premier point disponible pour positionner la bulle
      const availableResult = results.find((r: StreetViewDetectionResult) => r.available && r.closestPoint);
      if (availableResult && availableResult.closestPoint) {
        setDetectedPosition(availableResult.closestPoint);
      } else {
        // Si aucun point trouvé, utiliser la position du clic
        setDetectedPosition(latlng);
      }
      
      // Effacer l'info du clic
      setClickInfo(null);
    } catch (error) {
      console.error('Erreur lors de la détection des panoramas:', error);
      
      // En cas d'erreur, utiliser la position du clic
      setDetectedPosition(latlng);
      setDetectionResults([]);
      
      // Effacer l'info du clic
      setClickInfo(null);
    } finally {
      setIsDetecting(false);
    }
  };

  /**
   * Ferme la bulle de panorama
   */
  const closePanoramaBubble = () => {
    setDetectedPosition(null);
    setDetectionResults([]);
  };

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {/* Map container */}
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      
      {/* Custom layer control with improved design */}
      {mapInstance && (
        <div className="control-panel">
          <div 
            className={`control-panel-header ${isPanelCollapsed ? 'collapsed' : ''}`}
            onClick={togglePanel}
          >
            <span>Street View Layers</span>
            <div className="header-icon-container">
              <span className="header-map-icon">🗺️</span>
              <span className={`arrow-icon ${isPanelCollapsed ? 'collapsed' : ''}`}></span>
            </div>
          </div>
          
          <div className={`controls-container ${isPanelCollapsed ? 'collapsed' : ''}`}>
            {/* Google Street View */}
            <div 
              className={`control-item ${visibleLayers.googleStreetView ? 'active google' : ''}`}
              onClick={() => toggleLayer('googleStreetView')}
            >
              <div className="checkbox-container">
                <input 
                  type="checkbox" 
                  id="google-layer" 
                  checked={visibleLayers.googleStreetView} 
                  onChange={() => {}} // Controlled by parent div click
                  onClick={(e) => handleCheckboxClick(e, 'googleStreetView')}
                  className="checkbox-input google"
                />
              </div>
              <span 
                className={`provider-label google ${visibleLayers.googleStreetView ? 'active' : ''}`}
              >
                Google Street View
              </span>
            </div>
            
            {/* Bing Streetside */}
            <div 
              className={`control-item ${visibleLayers.bingStreetside ? 'active bing' : ''}`}
              onClick={() => toggleLayer('bingStreetside')}
            >
              <div className="checkbox-container">
                <input 
                  type="checkbox" 
                  id="bing-layer" 
                  checked={visibleLayers.bingStreetside} 
                  onChange={() => {}} // Controlled by parent div click
                  onClick={(e) => handleCheckboxClick(e, 'bingStreetside')}
                  className="checkbox-input bing"
                />
              </div>
              <span 
                className={`provider-label bing ${visibleLayers.bingStreetside ? 'active' : ''}`}
              >
                Bing Streetside
              </span>
            </div>
            
            {/* Yandex Panoramas */}
            <div 
              className={`control-item ${visibleLayers.yandexPanoramas ? 'active yandex' : ''}`}
              onClick={() => toggleLayer('yandexPanoramas')}
            >
              <div className="checkbox-container">
                <input 
                  type="checkbox" 
                  id="yandex-layer" 
                  checked={visibleLayers.yandexPanoramas} 
                  onChange={() => {}} // Controlled by parent div click
                  onClick={(e) => handleCheckboxClick(e, 'yandexPanoramas')}
                  className="checkbox-input yandex"
                />
              </div>
              <span 
                className={`provider-label yandex ${visibleLayers.yandexPanoramas ? 'active' : ''}`}
              >
                Yandex Panoramas
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Custom basemap selector */}
      {mapInstance && (
        <div className={`basemap-selector ${isBasemapSelectorOpen ? 'open' : ''}`}>
          <div className="basemap-selector-header" onClick={toggleBasemapSelector}>
            <span>Base Map</span>
            <span className="basemap-arrow"></span>
          </div>
          <div className="basemap-options">
            <div 
              className={`basemap-option ${currentBasemap === 'osm' ? 'active' : ''}`}
              onClick={() => changeBasemap('osm')}
            >
              <div className="basemap-option-icon basemap-icon-osm"></div>
              <span>OpenStreetMap</span>
            </div>
            <div 
              className={`basemap-option ${currentBasemap === 'carto' ? 'active' : ''}`}
              onClick={() => changeBasemap('carto')}
            >
              <div className="basemap-option-icon basemap-icon-carto"></div>
              <span>CARTO</span>
            </div>
            <div 
              className={`basemap-option ${currentBasemap === 'satellite' ? 'active' : ''}`}
              onClick={() => changeBasemap('satellite')}
            >
              <div className="basemap-option-icon basemap-icon-satellite"></div>
              <span>Satellite</span>
            </div>
            <div 
              className={`basemap-option ${currentBasemap === 'none' ? 'active' : ''}`}
              onClick={() => changeBasemap('none')}
            >
              <div className="basemap-option-icon basemap-icon-none"></div>
              <span>None</span>
            </div>
          </div>
        </div>
      )}

      {/* Street View layer components */}
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

      {/* PegCat control */}
      {mapInstance && (
        <PegcatControl
          map={mapInstance}
          minZoom={MIN_ZOOM_FOR_STREETVIEW}
          onPegcatDrop={handlePegcatDrop}
          onMapClick={handleMapClick}
        />
      )}

      {/* Bulle d'information temporaire (pour l'indication du clic/drop) */}
      {clickInfo && clickInfo.position && mapInstance && !isDetecting && !detectedPosition && (
        <div
          className="info-bubble"
          style={{
            position: 'absolute',
            left: mapInstance.latLngToContainerPoint(clickInfo.position).x,
            top: mapInstance.latLngToContainerPoint(clickInfo.position).y - 30,
            background: '#fefbf1',
            padding: '8px 12px',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            transform: 'translate(-50%, -100%)',
            fontSize: '14px',
            fontFamily: 'var(--font-geist-sans, sans-serif)',
            color: 'var(--sr-text, #333)',
            maxWidth: '250px',
            whiteSpace: 'nowrap'
          }}
        >
          <div style={{ fontWeight: '500' }}>
            {clickInfo.type === 'drop' ? '🐱 Cat dropped here' : '🖱️ Clicked here'}
          </div>
          <div>
            {clickInfo.position.lat.toFixed(6)}, {clickInfo.position.lng.toFixed(6)}
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              marginLeft: '-8px',
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #fefbf1'
            }}
          ></div>
        </div>
      )}

      {/* Indicateur pendant la détection */}
      {isDetecting && clickInfo && clickInfo.position && mapInstance && (
        <div
          className="detecting-bubble"
          style={{
            position: 'absolute',
            left: mapInstance.latLngToContainerPoint(clickInfo.position).x,
            top: mapInstance.latLngToContainerPoint(clickInfo.position).y - 30,
            background: '#fefbf1',
            padding: '10px 15px',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            transform: 'translate(-50%, -100%)',
            fontSize: '14px',
            fontFamily: 'var(--font-geist-sans, sans-serif)',
            color: 'var(--sr-text, #333)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--sr-primary, #9b4434)', borderBottomColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
          <div>Recherche de panoramas...</div>
          <div
            style={{
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              marginLeft: '-8px',
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #fefbf1'
            }}
          ></div>
        </div>
      )}

      {/* Bulle de panorama avec les résultats */}
      {detectedPosition && !isDetecting && mapInstance && (
        <PanoramaBubble
          map={mapInstance}
          detectionResults={detectionResults}
          position={detectedPosition}
          onClose={closePanoramaBubble}
        />
      )}

      {/* Style pour l'animation de chargement */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}