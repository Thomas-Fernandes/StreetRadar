/**
 * MapContainer.tsx
 *
 * This component manages the display and interaction with StreetRadar's main map.
 * It uses Leaflet to display an interactive map and overlays various Street View
 * coverage layers from different providers.
 */

'use client';

import { useEffect, useRef, useState } from 'react';

import { readMapHash, useMapUrlState } from '@/hooks/useMapUrlState';
import type { Basemap } from '@/lib/mapUrlState';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@/styles/leafletStyles.css';
import StreetViewLayer from '@/services/streetViewLayer';
import PegcatControl from './pegcatControl';
import PanoramaBubble from '@/components/map/panoramaBubble';
import StatisticsPanel from '@/components/map/statisticsPanel';
import ProviderWarning from '@/components/map/providerWarning';
import { useProviderWarnings } from '@/hooks/useProviderWarnings';
import { useMapUI } from '@/hooks/useMapUI';
import { usePanoramaDetection } from '@/hooks/usePanoramaDetection';
import Image from 'next/image';

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
export default function MapContainer({
    center = [46.603354, 1.888334],
    zoom = 3,
}: MapContainerProps) {
    // Reference to the map's DOM container
    const mapRef = useRef<HTMLDivElement>(null);
    // Leaflet map instance
    const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

    // The view carried by the URL, if any. A lazy useState initializer rather
    // than a ref: it runs exactly once and the value is stable, but unlike
    // reading ref.current during render it is safe under concurrent rendering —
    // which React 19.2's lint rules now enforce.
    const [initialUrlState] = useState(readMapHash);

    // Visible layers state
    const [visibleLayers, setVisibleLayers] = useState(() => {
        const defaults = {
            googleStreetView: true,
            bingStreetside: true,
            yandexPanoramas: false,
            appleLookAround: false,
            naverStreetView: false,
            jaStreetView: false,
        };

        // A link with no layer section keeps the defaults; one that lists none
        // meant it, and gets an empty map.
        if (!initialUrlState?.layers) return defaults;

        const fromUrl = { ...defaults };
        for (const key of Object.keys(fromUrl) as (keyof typeof fromUrl)[]) {
            fromUrl[key] = initialUrlState.layers.includes(key);
        }
        return fromUrl;
    });
    // Basemap selection
    const [currentBasemap, setCurrentBasemap] = useState(initialUrlState?.basemap ?? 'osm');
    // References to the basemap layers
    const basemapLayersRef = useRef<{ [key: string]: L.TileLayer }>({});
    // One-time notices for providers with known limitations. Four booleans
    // before — two per provider, kept in step by hand — and two now.
    const providerWarnings = useProviderWarnings();
    // Open/closed state for the panel, basemap picker and statistics drawer.
    const {
        isPanelCollapsed,
        isBasemapSelectorOpen,
        isStatisticsPanelOpen,
        togglePanel,
        toggleBasemapSelector,
        toggleStatisticsPanel,
        closeBasemapSelector,
    } = useMapUI();

    // Click -> detection -> bubble, and the marker that tracks the map while it
    // moves. Five pieces of state and three effects, none of them about layers.
    const {
        clickInfo,
        detectionResults,
        detectedPosition,
        isDetecting,
        markerScreenPos,
        handleMapClick,
        handlePegcatDrop,
        close: closePanoramaBubble,
    } = usePanoramaDetection({ map: mapInstance, visibleLayers });

    // Mirror the current view into the URL hash so a position can be shared.
    useMapUrlState({ map: mapInstance, visibleLayers, basemap: currentBasemap });

    // Minimum zoom level to activate Street View - reduced by 6 levels total (16 -> 13 -> 10)
    const MIN_ZOOM_FOR_STREETVIEW = 10;

    // Provider configuration with their information
    const providers = [
        {
            key: 'googleStreetView',
            name: 'Street View',
            shortName: 'Google',
            logo: '/images/providers/google.svg',
            color: '#4285F4',
        },
        {
            key: 'bingStreetside',
            name: 'Streetside',
            shortName: 'Bing',
            logo: '/images/providers/bing.svg',
            color: '#4285F4',
        },
        {
            key: 'appleLookAround',
            name: 'Look Around',
            shortName: 'Apple',
            logo: '/images/providers/apple.svg',
            color: '#e74c3c',
        },
        {
            key: 'yandexPanoramas',
            name: 'Panoramas',
            shortName: 'Yandex',
            logo: '/images/providers/yandex.svg',
            color: '#8661C5',
        },
        {
            key: 'naverStreetView',
            name: 'Street View',
            shortName: 'Naver',
            logo: '/images/providers/naver.svg',
            color: '#00c851',
        },
        {
            key: 'jaStreetView',
            name: 'Já 360',
            shortName: 'Já 360',
            logo: '/images/providers/ja.svg',
            color: '#ff6b35',
        },
    ];

    // Initialize Leaflet map
    useEffect(() => {
        if (!mapRef.current) return;

        // Fix for Leaflet icons
        delete (L.Icon.Default.prototype as L.Icon<L.IconOptions> & { _getIconUrl?: unknown })
            ._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/images/marker-icon-2x.png',
            iconUrl: '/images/marker-icon.png',
            shadowUrl: '/images/marker-shadow.png',
        });

        // Create map with streetradar-map class for our custom CSS
        const map = L.map(mapRef.current, {
            maxZoom: 19,
            zoomControl: false, // Disable default zoom control to reposition it
        }).setView(
            initialUrlState ? [initialUrlState.lat, initialUrlState.lon] : center,
            initialUrlState ? initialUrlState.zoom : zoom
        );

        // Add our custom CSS class to the map container
        map.getContainer().className += ' streetradar-map';

        // OSM base layer
        const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(map);

        // Alternative satellite layer
        const satellite = L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            {
                attribution:
                    'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                maxZoom: 19,
            }
        );

        // CARTO Voyager layer
        const carto = L.tileLayer(
            'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
            {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20,
            }
        );

        // Store references to basemap layers
        basemapLayersRef.current = {
            osm,
            satellite,
            carto,
        };

        // Add home button (custom) above zoom
        const HomeButtonControl = L.Control.extend({
            options: {
                position: 'topleft',
            },
            onAdd: function () {
                const container = L.DomUtil.create(
                    'div',
                    'leaflet-bar leaflet-control home-control'
                );
                const button = L.DomUtil.create('a', 'home-button', container);

                button.innerHTML = '🏠';
                button.title = 'Back to home';
                button.href = '/'; // Link to home page

                return container;
            },
        });

        map.addControl(new HomeButtonControl()); // Home button first
        L.control
            .zoom({
                // Zoom control second
                position: 'topleft',
            })
            .addTo(map);

        // A shared link can name a basemap other than the OSM default added
        // above; apply it once the layer refs exist.
        if (initialUrlState && initialUrlState.basemap !== 'osm') {
            const chosen = basemapLayersRef.current[initialUrlState.basemap];
            map.removeLayer(osm);
            if (chosen) chosen.addTo(map);
        }

        setMapInstance(map);

        // Cleanup on unmount
        return () => {
            map.remove();
        };
        // initialUrlState is a useRef().current and never changes identity;
        // it is listed to satisfy exhaustive-deps, not because it can vary.
    }, [center, zoom, initialUrlState]);

    // Effect to manage map cursor based on zoom level
    useEffect(() => {
        if (!mapInstance) return;

        const handleZoom = () => {
            const currentZoom = mapInstance.getZoom();
            if (currentZoom >= MIN_ZOOM_FOR_STREETVIEW) {
                mapInstance.getContainer().classList.add('map-clickable');
            } else {
                mapInstance.getContainer().classList.remove('map-clickable');
            }
        };

        mapInstance.on('zoomend', handleZoom);
        // Initialize on load
        handleZoom();

        return () => {
            mapInstance.off('zoomend', handleZoom);
        };
    }, [mapInstance]);

    // Function to toggle layer visibility
    const toggleLayer = (layer: keyof typeof visibleLayers) => {
        // Only when switching a layer on, and only the first time for that provider.
        if (!visibleLayers[layer]) {
            providerWarnings.warnOnce(layer);
        }

        setVisibleLayers((prev) => ({
            ...prev,
            [layer]: !prev[layer],
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

    // Function to change basemap
    const changeBasemap = (basemap: Basemap) => {
        if (!mapInstance || !basemapLayersRef.current) return;

        // Remove all basemap layers
        Object.values(basemapLayersRef.current).forEach((layer) => {
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
        closeBasemapSelector();
    };

    return (
        <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
            {/* Map container */}
            <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

            {/* Custom layer control with improved design */}
            {mapInstance && (
                <div className={`control-panel ${isStatisticsPanelOpen ? 'stats-open' : ''}`}>
                    <div
                        className={`control-panel-header ${isPanelCollapsed ? 'collapsed' : ''}`}
                        onClick={togglePanel}
                    >
                        <span>Street View Layers</span>
                        <div className="header-icon-container">
                            <span className="header-map-icon">🗺️</span>
                            <span
                                className={`arrow-icon ${isPanelCollapsed ? 'collapsed' : ''}`}
                            ></span>
                        </div>
                    </div>

                    <div className={`controls-container ${isPanelCollapsed ? 'collapsed' : ''}`}>
                        {providers.map((provider) => (
                            <div
                                key={provider.key}
                                className={`control-item ${visibleLayers[provider.key as keyof typeof visibleLayers] ? 'active' : ''}`}
                                onClick={() =>
                                    toggleLayer(provider.key as keyof typeof visibleLayers)
                                }
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    background: 'transparent',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer',
                                    borderTop: '1px solid transparent',
                                    borderRight: '1px solid transparent',
                                    borderBottom: '1px solid transparent',
                                    borderLeft: visibleLayers[
                                        provider.key as keyof typeof visibleLayers
                                    ]
                                        ? `3px solid ${provider.color}`
                                        : '1px solid transparent',
                                    ...(visibleLayers[
                                        provider.key as keyof typeof visibleLayers
                                    ] && {
                                        background: `rgba(${
                                            provider.color === '#4285F4'
                                                ? '66, 133, 244'
                                                : provider.color === '#8661C5'
                                                  ? '134, 97, 197'
                                                  : provider.color === '#e74c3c'
                                                    ? '231, 76, 60'
                                                    : '134, 97, 197'
                                        }, 0.1)`,
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                    }),
                                }}
                                onMouseOver={(e) => {
                                    if (
                                        !visibleLayers[provider.key as keyof typeof visibleLayers]
                                    ) {
                                        e.currentTarget.style.background =
                                            'rgba(255, 255, 255, 0.3)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (
                                        !visibleLayers[provider.key as keyof typeof visibleLayers]
                                    ) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                {/* Provider logo */}
                                <div
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        marginRight: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Image
                                        src={provider.logo}
                                        alt={`${provider.shortName} Logo`}
                                        width={20}
                                        height={20}
                                    />
                                </div>

                                {/* Checkbox */}
                                <div
                                    style={{
                                        position: 'relative',
                                        width: '18px',
                                        height: '18px',
                                        marginRight: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        id={`${provider.key}-layer`}
                                        checked={
                                            visibleLayers[
                                                provider.key as keyof typeof visibleLayers
                                            ]
                                        }
                                        onChange={() => {}} // Controlled by parent div click
                                        onClick={(e) =>
                                            handleCheckboxClick(
                                                e,
                                                provider.key as keyof typeof visibleLayers
                                            )
                                        }
                                        style={{
                                            width: '16px',
                                            height: '16px',
                                            cursor: 'pointer',
                                            accentColor: provider.color,
                                        }}
                                    />
                                </div>

                                {/* Provider name */}
                                <span
                                    style={{
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        flex: 1,
                                        color: provider.color,
                                        fontWeight: visibleLayers[
                                            provider.key as keyof typeof visibleLayers
                                        ]
                                            ? '500'
                                            : '400',
                                    }}
                                >
                                    {provider.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Statistics Panel */}
            {mapInstance && (
                <StatisticsPanel isOpen={isStatisticsPanelOpen} onToggle={toggleStatisticsPanel} />
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
                    <StreetViewLayer
                        map={mapInstance}
                        provider="apple"
                        visible={visibleLayers.appleLookAround}
                    />
                    <StreetViewLayer
                        map={mapInstance}
                        provider="naver"
                        visible={visibleLayers.naverStreetView}
                    />
                    <StreetViewLayer
                        map={mapInstance}
                        provider="ja"
                        visible={visibleLayers.jaStreetView}
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

            {/* Temporary information bubble (for click/drop indication) */}
            {clickInfo &&
                clickInfo.position &&
                mapInstance &&
                !isDetecting &&
                !detectedPosition &&
                markerScreenPos && (
                    <div
                        className="info-bubble"
                        style={{
                            position: 'absolute',
                            left: markerScreenPos.x,
                            top: markerScreenPos.y - 30,
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
                            whiteSpace: 'nowrap',
                            pointerEvents: 'auto',
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
                                borderTop: '8px solid #fefbf1',
                            }}
                        ></div>
                    </div>
                )}

            {/* Indicator during detection */}
            {isDetecting && clickInfo && clickInfo.position && mapInstance && markerScreenPos && (
                <div
                    className="detecting-bubble"
                    style={{
                        position: 'absolute',
                        left: markerScreenPos.x,
                        top: markerScreenPos.y - 30,
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
                        gap: '8px',
                        pointerEvents: 'auto',
                    }}
                >
                    <div
                        style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            border: '2px solid var(--sr-primary, #9b4434)',
                            borderBottomColor: 'transparent',
                            animation: 'spin 1s linear infinite',
                        }}
                    ></div>
                    <div>Searching for panoramas...</div>
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '-8px',
                            left: '50%',
                            marginLeft: '-8px',
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderTop: '8px solid #fefbf1',
                        }}
                    ></div>
                </div>
            )}

            {/* Panorama bubble with results */}
            {detectedPosition && !isDetecting && mapInstance && (
                <PanoramaBubble
                    map={mapInstance}
                    detectionResults={detectionResults}
                    position={detectedPosition}
                    onClose={closePanoramaBubble}
                />
            )}

            {/* One-time notice for providers with known limitations. */}
            {providerWarnings.active && (
                <ProviderWarning
                    provider={providerWarnings.active}
                    onDismiss={providerWarnings.dismiss}
                />
            )}

            {/* Loading animation styles */}
            <style jsx>{`
                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }

                @keyframes fadeIn {
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }

                @keyframes popIn {
                    0% {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
}
