/**
 * pegcatControl.tsx
 * 
 * Contrôle PegCat qui s'intègre dans la structure Leaflet
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import Image from 'next/image';

interface PegcatControlProps {
  map: L.Map | null;
  minZoom: number;
  onPegcatDrop: (latlng: L.LatLng) => void;
  onMapClick: (latlng: L.LatLng) => void;
}

const PegcatControl: React.FC<PegcatControlProps> = ({ 
  map, 
  minZoom = 16,
  onPegcatDrop,
  onMapClick
}) => {
  const [pegcatState, setPegcatState] = useState<'stop' | 'ready' | 'dragging'>('stop');
  const [dragPosition, setDragPosition] = useState<{x: number, y: number} | null>(null);
  
  // Références persistantes
  const controlRef = useRef<L.Control | null>(null);
  const buttonRef = useRef<HTMLElement | null>(null);
  const imgContainerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLElement | null>(null);
  
  // Création du contrôle une seule fois
  useEffect(() => {
    if (!map) return;

    // Créer un contrôle Leaflet personnalisé
    const PegcatButtonControl = L.Control.extend({
      options: {
        position: 'topleft'
      },
      
      onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control pegcat-control');
        const button = L.DomUtil.create('a', 'pegcat-button', container);
        
        button.href = '#';
        button.title = 'Drag to explore Street View';
        button.setAttribute('role', 'button');
        
        // Conteneur pour l'image
        const imgContainer = L.DomUtil.create('div', 'pegcat-img-container', button);
        
        // Tooltip
        const tooltip = L.DomUtil.create('div', 'pegcat-button-tooltip', button);
        tooltip.textContent = 'Drag me !';
        
        // Stocker les références
        buttonRef.current = button;
        imgContainerRef.current = imgContainer;
        tooltipRef.current = tooltip;
        
        // Prévenir les comportements par défaut
        L.DomEvent
          .disableClickPropagation(container)
          .disableScrollPropagation(container)
          .on(button, 'click', L.DomEvent.preventDefault);
        
        return container;
      }
    });
    
    // Créer et ajouter le contrôle à la carte
    const control = new PegcatButtonControl().addTo(map);
    controlRef.current = control;
    
    return () => {
      if (map && control) {
        map.removeControl(control);
      }
    };
  }, [map]); // Dépendance uniquement sur map pour éviter les recréations

  // Gestion du zoom et mise à jour de l'état
  useEffect(() => {
    if (!map) return;
    
    const handleZoomEnd = () => {
      const zoom = map.getZoom();
      
      if (zoom >= minZoom) {
        setPegcatState(prevState => prevState === 'dragging' ? 'dragging' : 'ready');
      } else {
        setPegcatState('stop');
      }
    };
    
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (pegcatState !== 'dragging' && map.getZoom() >= minZoom) {
        onMapClick(e.latlng);
      }
    };
    
    map.on('zoomend', handleZoomEnd);
    map.on('click', handleMapClick);
    
    // Initialiser l'état
    handleZoomEnd();
    
    return () => {
      map.off('zoomend', handleZoomEnd);
      map.off('click', handleMapClick);
    };
  }, [map, minZoom, onMapClick, pegcatState]);

  // Mise à jour de l'apparence du bouton selon l'état
  useEffect(() => {
    if (!buttonRef.current || !imgContainerRef.current || !tooltipRef.current) return;
    
    const button = buttonRef.current;
    const imgContainer = imgContainerRef.current;
    const tooltip = tooltipRef.current;
    
    // Mettre à jour les classes et styles selon l'état
    button.className = 'pegcat-button';
    button.classList.add(pegcatState);
    
    // Mettre à jour l'image
    imgContainer.innerHTML = '';
    const img = document.createElement('img');
    img.src = getPegcatImage();
    img.alt = "Street View Cat";
    img.width = 24;
    img.height = 24;
    img.draggable = false;
    imgContainer.appendChild(img);
    
    // Mettre à jour le texte du tooltip
    tooltip.textContent = pegcatState === 'stop' ? "Please zoom in" : "I'm ready !";
    
    // Gestionnaire d'événements pour le drag
    if (pegcatState === 'ready') {
      button.onmousedown = startDrag;
    } else {
      button.onmousedown = null;
    }
    
  }, [pegcatState]);

  // Chemin de l'image en fonction de l'état
  const getPegcatImage = () => {
    switch (pegcatState) {
      case 'stop':
        return '/images/pegcat/cat_stop.png';
      case 'ready':
        return '/images/pegcat/cat_ready.png';
      case 'dragging':
        return '/images/pegcat/cat_drop.png';
      default:
        return '/images/pegcat/cat_ready.png';
    }
  };

  // Démarrer le drag
  const startDrag = (e: MouseEvent) => {
    if (!map || pegcatState !== 'ready') return;
    
    e.preventDefault();
    e.stopPropagation();
    setPegcatState('dragging');
    
    setDragPosition({
      x: e.clientX,
      y: e.clientY
    });
    
    const moveWithCursor = (event: MouseEvent) => {
      setDragPosition({
        x: event.clientX,
        y: event.clientY
      });
    };
    
    const finishDrag = (event: MouseEvent) => {
      setPegcatState('ready');
      setDragPosition(null);
      
      if (map) {
        const point = L.point(event.clientX, event.clientY);
        const latlng = map.containerPointToLatLng(point);
        onPegcatDrop(latlng);
      }
      
      document.removeEventListener('mouseup', finishDrag);
      document.removeEventListener('mousemove', moveWithCursor);
    };
    
    document.addEventListener('mouseup', finishDrag);
    document.addEventListener('mousemove', moveWithCursor);
  };

  return (
    <>
      {/* Image qui suit le curseur pendant le drag */}
      {pegcatState === 'dragging' && dragPosition && (
        <div 
          style={{
            position: 'fixed',
            left: `${dragPosition.x - 25}px`,
            top: `${dragPosition.y}px`,
            zIndex: 1001,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.2))'
          }}
        >
          <Image 
            src="/images/pegcat/cat_drop.png"
            alt="Dragging Street View cat"
            width={50}
            height={50}
            draggable={false}
          />
        </div>
      )}
    </>
  );
};

export default PegcatControl;