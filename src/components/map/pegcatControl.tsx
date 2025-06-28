/**
 * pegcatControl.tsx
 * 
 * PegCat control that integrates with Leaflet structure
 * Fixed version to prevent involuntary clicks
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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
  
  // Persistent references
  const controlRef = useRef<L.Control | null>(null);
  const buttonRef = useRef<HTMLElement | null>(null);
  const imgContainerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLElement | null>(null);
  
  // Flag to know if we started a drag
  const isDraggingRef = useRef<boolean>(false);
  
  // Image path based on state
  const getPegcatImage = useCallback(() => {
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
  }, [pegcatState]);

  // Start drag
  const startDrag = useCallback((e: MouseEvent) => {
    if (!map || pegcatState !== 'ready') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Reset drag flag
    isDraggingRef.current = false;
    
    setPegcatState('dragging');
    
    setDragPosition({
      x: e.clientX,
      y: e.clientY
    });
    
    const moveWithCursor = (event: MouseEvent) => {
      // Mark that we moved (so it's really a drag)
      isDraggingRef.current = true;
      
      setDragPosition({
        x: event.clientX,
        y: event.clientY
      });
    };
    
    const finishDrag = (event: MouseEvent) => {
      setPegcatState('ready');
      setDragPosition(null);
      
      // If we really dragged, perform the drop
      if (isDraggingRef.current && map) {
        const point = L.point(event.clientX, event.clientY);
        const latlng = map.containerPointToLatLng(point);
        onPegcatDrop(latlng);
      }
      
      // Reset flag
      isDraggingRef.current = false;
      
      document.removeEventListener('mouseup', finishDrag);
      document.removeEventListener('mousemove', moveWithCursor);
    };
    
    document.addEventListener('mouseup', finishDrag);
    document.addEventListener('mousemove', moveWithCursor);
  }, [map, pegcatState, onPegcatDrop]);
  
  // Create control only once
  useEffect(() => {
    if (!map) return;

    // Create a custom Leaflet control
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
        
        // Container for the image
        const imgContainer = L.DomUtil.create('div', 'pegcat-img-container', button);
        
        // Tooltip
        const tooltip = L.DomUtil.create('div', 'pegcat-button-tooltip', button);
        tooltip.textContent = 'Drag me !';
        
        // Store references
        buttonRef.current = button;
        imgContainerRef.current = imgContainer;
        tooltipRef.current = tooltip;
        
        // Prevent default behaviors AND propagation
        L.DomEvent
          .disableClickPropagation(container)
          .disableScrollPropagation(container)
          .on(button, 'click', function(e) {
            L.DomEvent.preventDefault(e);
            L.DomEvent.stopPropagation(e);
            
            // If we didn't drag, it's a simple click - do nothing
            if (!isDraggingRef.current) {
              // Simple click on button - silently ignored
            }
          })
          .on(button, 'mousedown', function(e) {
            L.DomEvent.preventDefault(e);
            L.DomEvent.stopPropagation(e);
          })
          .on(button, 'mouseup', function(e) {
            L.DomEvent.preventDefault(e);
            L.DomEvent.stopPropagation(e);
          });
        
        return container;
      }
    });
    
    // Create and add control to the map
    const control = new PegcatButtonControl().addTo(map);
    controlRef.current = control;
    
    return () => {
      if (map && control) {
        map.removeControl(control);
      }
    };
  }, [map]); // Dependency only on map to avoid recreations

  // Zoom handling and state update
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
      // Don't handle click if we're dragging PegCat
      if (pegcatState === 'dragging') return;
      
      // Don't handle click if zoom is insufficient
      if (map.getZoom() < minZoom) return;
      
      // Call click handling function
      onMapClick(e.latlng);
    };
    
    map.on('zoomend', handleZoomEnd);
    map.on('click', handleMapClick);
    
    // Initialize state
    handleZoomEnd();
    
    return () => {
      map.off('zoomend', handleZoomEnd);
      map.off('click', handleMapClick);
    };
  }, [map, minZoom, onMapClick, pegcatState]);

  // Update button appearance based on state
  useEffect(() => {
    if (!buttonRef.current || !imgContainerRef.current || !tooltipRef.current) return;
    
    const button = buttonRef.current;
    const imgContainer = imgContainerRef.current;
    const tooltip = tooltipRef.current;
    
    // Update classes and styles based on state
    button.className = 'pegcat-button';
    button.classList.add(pegcatState);
    
    // Update image
    imgContainer.innerHTML = '';
    const img = document.createElement('img');
    img.src = getPegcatImage();
    img.alt = "Street View Cat";
    img.width = 24;
    img.height = 24;
    img.draggable = false;
    imgContainer.appendChild(img);
    
    // Update tooltip text
    tooltip.textContent = pegcatState === 'stop' ? "Please zoom in" : "I'm ready !";
    
    // Event handler for drag
    if (pegcatState === 'ready') {
      button.onmousedown = startDrag;
    } else {
      button.onmousedown = null;
    }
    
  }, [pegcatState, getPegcatImage, startDrag]);

  return (
    <>
      {/* Image that follows cursor during drag */}
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