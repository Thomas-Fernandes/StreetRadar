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

  // Function to toggle layer visibility
  const toggleLayer = (layer: keyof typeof visibleLayers) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
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
    
    // Add the selected basemap
    if (basemapLayersRef.current[basemap]) {
      basemapLayersRef.current[basemap].addTo(mapInstance);
      setCurrentBasemap(basemap);
    }
    
    // Close the selector after selection
    setIsBasemapSelectorOpen(false);
  };

  // Toggle basemap selector
  const toggleBasemapSelector = () => {
    setIsBasemapSelectorOpen(!isBasemapSelectorOpen);
  };

  // Control panel styles - redesigned and harmonized
  const controlPanelStyle = {
    position: 'absolute' as const,
    top: '15px',
    right: '15px',
    backgroundColor: 'var(--sr-background, #fefbf1)',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    zIndex: 1000,
    width: '250px',
    fontFamily: 'var(--font-geist-sans, sans-serif)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
    overflow: 'hidden'
  };

  // Header style
  const headerStyle = {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--sr-primary, #9b4434)',
    borderBottom: isPanelCollapsed ? '0px solid transparent' : '2px solid rgba(155, 68, 52, 0.15)',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    userSelect: 'none' as const,
    transition: 'all 0.2s ease'
  };

  // Controls container style
  const controlsContainerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    padding: isPanelCollapsed ? '0 16px' : '16px',
    maxHeight: isPanelCollapsed ? '0' : '300px',
    opacity: isPanelCollapsed ? 0 : 1,
    transition: 'all 0.3s ease',
    overflow: 'hidden'
  };

  // Control item style
  const controlItemStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 10px',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: '1px solid transparent'
  };

  // Checkbox container style
  const checkboxContainerStyle = {
    position: 'relative' as const,
    width: '20px',
    height: '20px',
    marginRight: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Provider colors
  const providerColors = {
    google: '#4285F4',     // Blue for Google
    bing: '#4285F4',       // Teal for Bing
    yandex: '#8661C5'      // Purple for Yandex
  };

  // Function to generate hover style based on provider
  const getHoverStyle = (provider: string, isChecked: boolean) => {
    const color = providerColors[provider as keyof typeof providerColors];
    
    return {
      backgroundColor: isChecked ? `rgba(${hexToRgb(color)}, 0.1)` : 'rgba(255, 255, 255, 0.5)',
      borderLeft: isChecked ? `3px solid ${color}` : '1px solid transparent',
      boxShadow: isChecked ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none'
    };
  };

  // Function to convert hex color to RGB
  function hexToRgb(hex: string) {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Parse RGB values
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    
    return `${r}, ${g}, ${b}`;
  }

  // Arrow icon that rotates based on panel state
  const arrowIcon = {
    display: 'inline-block',
    width: '10px',
    height: '10px',
    borderRight: '2px solid var(--sr-primary, #9b4434)',
    borderBottom: '2px solid var(--sr-primary, #9b4434)',
    transform: isPanelCollapsed ? 'rotate(-45deg)' : 'rotate(45deg)',
    transition: 'transform 0.3s ease',
    marginLeft: '8px'
  };

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {/* Map container */}
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      
      {/* Custom layer control with improved design */}
      {mapInstance && (
        <div style={controlPanelStyle}>
          <div 
            style={headerStyle}
            onClick={togglePanel}
          >
            <span>Street View Layers</span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--sr-text-light, #666666)', marginRight: '4px' }}>🗺️</span>
              <span style={arrowIcon}></span>
            </div>
          </div>
          
          <div style={controlsContainerStyle}>
            {/* Google Street View */}
            <div 
              style={{
                ...controlItemStyle,
                ...getHoverStyle('google', visibleLayers.googleStreetView)
              }}
              onClick={() => toggleLayer('googleStreetView')}
            >
              <div style={checkboxContainerStyle}>
                <input 
                  type="checkbox" 
                  id="google-layer" 
                  checked={visibleLayers.googleStreetView} 
                  onChange={() => {}} 
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: providerColors.google,
                    cursor: 'pointer'
                  }}
                />
              </div>
              <label 
                htmlFor="google-layer" 
                style={{ 
                  color: providerColors.google,
                  cursor: 'pointer',
                  fontWeight: visibleLayers.googleStreetView ? 500 : 400,
                  fontSize: '14px',
                  flex: 1
                }}
              >
                Google Street View
              </label>
            </div>
            
            {/* Bing Streetside */}
            <div 
              style={{
                ...controlItemStyle,
                ...getHoverStyle('bing', visibleLayers.bingStreetside)
              }}
              onClick={() => toggleLayer('bingStreetside')}
            >
              <div style={checkboxContainerStyle}>
                <input 
                  type="checkbox" 
                  id="bing-layer" 
                  checked={visibleLayers.bingStreetside} 
                  onChange={() => {}} 
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: providerColors.bing,
                    cursor: 'pointer'
                  }}
                />
              </div>
              <label 
                htmlFor="bing-layer" 
                style={{ 
                  color: providerColors.bing,
                  cursor: 'pointer',
                  fontWeight: visibleLayers.bingStreetside ? 500 : 400,
                  fontSize: '14px',
                  flex: 1
                }}
              >
                Bing Streetside
              </label>
            </div>
            
            {/* Yandex Panoramas */}
            <div 
              style={{
                ...controlItemStyle,
                ...getHoverStyle('yandex', visibleLayers.yandexPanoramas)
              }}
              onClick={() => toggleLayer('yandexPanoramas')}
            >
              <div style={checkboxContainerStyle}>
                <input 
                  type="checkbox" 
                  id="yandex-layer" 
                  checked={visibleLayers.yandexPanoramas} 
                  onChange={() => {}} 
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: providerColors.yandex,
                    cursor: 'pointer'
                  }}
                />
              </div>
              <label 
                htmlFor="yandex-layer" 
                style={{ 
                  color: providerColors.yandex,
                  cursor: 'pointer',
                  fontWeight: visibleLayers.yandexPanoramas ? 500 : 400,
                  fontSize: '14px',
                  flex: 1
                }}
              >
                Yandex Panoramas
              </label>
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
    </div>
  );
}