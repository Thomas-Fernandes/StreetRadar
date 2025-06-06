/**
 * PanoramaBubble.tsx
 * 
 * Afficher les fournisseurs disponibles à l'utilisateur avec un design amélioré.
 * Le popup est maintenant fixe sur la position géographique et suit les mouvements de la carte.
 */

'use client';

import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import Image from 'next/image';
import { StreetViewDetectionResult } from '@/services/streetViewDetectionCanvas';

interface PanoramaBubbleProps {
  map: L.Map | null;
  detectionResults: StreetViewDetectionResult[];
  position: L.LatLng;
  onClose: () => void;
}

/**
 * Génère l'URL pour ouvrir un panorama chez un fournisseur spécifique
 */
function getPanoramaUrl(result: StreetViewDetectionResult): string {
  if (!result.closestPoint) return '#';
  
  const lat = result.closestPoint.lat.toFixed(6);
  const lng = result.closestPoint.lng.toFixed(6);
  
  switch (result.provider) {
    case 'google':
      return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
    case 'bing':
      return `https://www.bing.com/maps?cp=${lat}~${lng}&lvl=19&style=x`;
    case 'yandex':
      return `https://yandex.com/maps/?panorama%5Bpoint%5D=${lng}%2C${lat}&l=stv`;
    case 'apple':
      // Apple n'a pas d'URL publique pour Look Around, rediriger vers Maps
      return `https://maps.apple.com/?ll=${lat},${lng}&spn=0.001,0.001`;
    default:
      return '#';
  }
}

/**
 * Composant de bulle pour les panoramas détectés
 * Maintenant avec position géographique fixe et design amélioré
 */
const PanoramaBubble: React.FC<PanoramaBubbleProps> = ({ 
  map, 
  detectionResults, 
  position,
  onClose
}) => {
  // État pour la position en pixels sur l'écran
  const [screenPosition, setScreenPosition] = useState<{x: number, y: number} | null>(null);
  // État pour l'animation d'apparition
  const [isVisible, setIsVisible] = useState(false);

  // Effet pour mettre à jour la position du popup quand la carte bouge
  useEffect(() => {
    if (!map) return;

    const updatePosition = () => {
      try {
        const point = map.latLngToContainerPoint(position);
        setScreenPosition({ x: point.x, y: point.y });
      } catch (error) {
        console.error('Erreur lors de la conversion des coordonnées:', error);
      }
    };

    // Mettre à jour la position initiale
    updatePosition();

    // Écouter les événements de mouvement de la carte
    const events = ['move', 'zoom', 'zoomstart', 'zoomend', 'movestart', 'moveend'];
    events.forEach(event => {
      map.on(event as any, updatePosition);
    });

    // Nettoyage des event listeners
    return () => {
      events.forEach(event => {
        map.off(event as any, updatePosition);
      });
    };
  }, [map, position]);

  // Effet pour l'animation d'apparition
  useEffect(() => {
    if (screenPosition) {
      // Petit délai pour déclencher l'animation
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [screenPosition]);

  // Ne pas rendre si on n'a pas encore la position à l'écran
  if (!map || !screenPosition) {
    return null;
  }

  // Filtrer pour ne garder que les fournisseurs disponibles
  const availableProviders = detectionResults.filter(result => result.available);
  
  // Si aucun fournisseur n'est disponible
  if (availableProviders.length === 0) {
    return (
      <div
        className="no-panorama-bubble"
        style={{
          position: 'absolute',
          left: screenPosition.x,
          top: screenPosition.y - 30,
          background: '#fefbf1',
          padding: '10px 15px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          transform: `translate(-50%, -100%) scale(${isVisible ? 1 : 0.8})`,
          fontFamily: 'var(--font-geist-sans, sans-serif)',
          color: 'var(--sr-text, #333)',
          maxWidth: '250px',
          textAlign: 'center',
          pointerEvents: 'auto',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <div style={{ marginBottom: '8px', fontWeight: 500 }}>
          😿 No panoramas available
        </div>
        <div style={{ fontSize: '12px', marginBottom: '8px', color: 'var(--sr-text-light, #666)' }}>
          Position: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </div>
        <div style={{ fontSize: '12px', marginBottom: '8px', color: 'var(--sr-text-light, #666)' }}>
          Checked providers: {detectionResults.map(r => r.provider).join(', ')}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'var(--sr-primary, #9b4434)',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
        >
          Close
        </button>
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
    );
  }
  
  // Sinon, afficher les fournisseurs disponibles
  return (
    <div
      className="panorama-bubble"
      style={{
        position: 'absolute',
        left: screenPosition.x,
        top: screenPosition.y - 30,
        background: '#fefbf1',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        transform: `translate(-50%, -100%) scale(${isVisible ? 1 : 0.8})`,
        fontFamily: 'var(--font-geist-sans, sans-serif)',
        color: 'var(--sr-text, #333)',
        maxWidth: '300px',
        pointerEvents: 'auto',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
    >
      <div style={{ marginBottom: '10px', fontWeight: 500, textAlign: 'center' }}>
        🐱 Available providers
      </div>
      
      <div style={{ fontSize: '12px', marginBottom: '12px', color: 'var(--sr-text-light, #666)', textAlign: 'center' }}>
        Position : {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
        {availableProviders.map((result) => (
          <a
            key={result.provider}
            href={getPanoramaUrl(result)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '12px',
              borderRadius: '8px',
              background: '#fefbf1', // Même couleur que le fond du popup
              border: '1px solid rgba(155, 68, 52, 0.1)',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              width: '80px', // Largeur fixe pour tous les providers
              minHeight: '70px' // Hauteur minimale pour éviter les variations
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background = '#fefbf1';
            }}
          >
            <div style={{ width: '32px', height: '32px', position: 'relative', marginBottom: '8px' }}>
              <Image
                src={`/images/providers/${result.provider}.svg`}
                alt={`${result.provider} Logo`}
                width={32}
                height={32}
              />
            </div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '500',
              textAlign: 'center',
              lineHeight: '1.2',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: '100%'
            }}>
              {result.provider === 'google' && 'Google'}
              {result.provider === 'bing' && 'Bing'}
              {result.provider === 'yandex' && 'Yandex'}
              {result.provider === 'apple' && 'Apple'}
            </div>
          </a>
        ))}
      </div>
      
      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: '1px solid var(--sr-primary, #9b4434)',
            color: 'var(--sr-primary, #9b4434)',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'var(--sr-primary, #9b4434)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--sr-primary, #9b4434)';
          }}
        >
          Close
        </button>
      </div>
      
      {/* Flèche pointant vers la position exacte */}
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
  );
};

export default PanoramaBubble;