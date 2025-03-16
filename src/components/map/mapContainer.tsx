'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapContainerProps {
    center: [number, number];
    zoom: number;
}

const MapContainer = ({ center, zoom }: MapContainerProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
    
    // Debug logs
    useEffect(() => {
        console.log("MapContainer mounted, ref exists:", !!mapRef.current);
    }, []);

    // Fix pour les icônes Leaflet
    useEffect(() => {
        try {
            // Fix pour les icônes Leaflet
            delete (L.Icon.Default.prototype as Partial<{ _getIconUrl: unknown }>)._getIconUrl;
            
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: '/images/marker-icon-2x.png',
                iconUrl: '/images/marker-icon.png',
                shadowUrl: '/images/marker-shadow.png',
            });
            
            console.log("Leaflet icons set up");
        } catch (e) {
            console.error("Error setting up Leaflet icons:", e);
        }
    }, []);

    useEffect(() => {
        if (!mapRef.current) {
            console.error("Map ref is not available");
            return;
        }
        
        if (mapInstance) {
            console.log("Map already initialized");
            return;
        }
        
        try {
            console.log("Initializing map...");
            // Initialiser la carte
            const map = L.map(mapRef.current).setView(center, zoom);
            
            console.log("Map initialized, adding tiles...");
            
            // Ajouter des couches de base
            const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            });

            const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                maxZoom: 19,
            });

            const baseMaps = {
                "OpenStreetMap": osm,
                "Satellite": satellite,
            };

            // Contrôle de couches
            L.control.layers(baseMaps).addTo(map);

            // Définir la couche par défaut
            osm.addTo(map);

            console.log("Map fully set up");
            setMapInstance(map);

            // Nettoyage lors du démontage du composant
            return () => {
                console.log("Cleaning up map");
                map.remove();
            };
        } catch (e) {
            console.error("Error initializing map:", e);
        }
    }, [center, zoom, mapInstance]);

    return (
        <div 
            ref={mapRef} 
            style={{ 
                height: '100%', 
                width: '100%', 
                backgroundColor: "#e0e0e0",
                minHeight: "400px"  // Hauteur minimale pour s'assurer que la carte est visible
            }} 
        />
    );
};

export default MapContainer;