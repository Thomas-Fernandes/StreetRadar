/**
 * PanoramaBubble.tsx
 * 
 * Display available providers to the user with improved design.
 * The popup is now fixed on geographic position and follows map movements.
 */

'use client';

import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import Image from 'next/image';
import { StreetViewDetectionResult } from '@/services/streetViewDetectionCanvas';
import { PanoramaService } from '@/services/panoramaService';

interface PanoramaBubbleProps {
  map: L.Map | null;
  detectionResults: StreetViewDetectionResult[];
  position: L.LatLng;
  onClose: () => void;
}

/**
 * Interface for provider button with URL
 */
interface ProviderButton {
  provider: StreetViewDetectionResult['provider'];
  url: string;
}

/**
 * Bubble component for detected panoramas
 * Now with fixed geographic position and improved design
 */
const PanoramaBubble: React.FC<PanoramaBubbleProps> = ({ 
  map, 
  detectionResults, 
  position,
  onClose
}) => {
  // State for the position in pixels on screen
  const [screenPosition, setScreenPosition] = useState<{x: number, y: number} | null>(null);
  // State for the appearance animation
  const [isVisible, setIsVisible] = useState(false);
  // State for provider buttons with optimized URLs
  const [providerButtons, setProviderButtons] = useState<ProviderButton[]>([]);

  // Effect to update popup position when the map moves
  useEffect(() => {
    if (!map) return;

    const updatePosition = () => {
      try {
        const point = map.latLngToContainerPoint(position);
        setScreenPosition({ x: point.x, y: point.y });
      } catch (error) {
        console.error('Error during coordinate conversion:', error);
      }
    };

    // Update initial position
    updatePosition();

    // Listen to map movement events
    const events: (keyof L.LeafletEventHandlerFnMap)[] = ['move', 'zoom', 'zoomstart', 'zoomend', 'movestart', 'moveend'];
    events.forEach(event => {
      map.on(event, updatePosition);
    });

    // Cleanup event listeners
    return () => {
      events.forEach(event => {
        map.off(event, updatePosition);
      });
    };
  }, [map, position]);

  // Effect to generate optimized URLs for available providers
  useEffect(() => {
    const generateOptimizedUrls = async () => {
      const availableProviders = detectionResults.filter(result => result.available);
      const buttons: ProviderButton[] = [];
      
      for (const result of availableProviders) {
        try {
          const url = await PanoramaService.getOptimizedPanoramaUrl(result);
          buttons.push({
            provider: result.provider,
            url: url
          });
        } catch (error) {
          console.error(`Error generating URL for ${result.provider}:`, error);
          // Fallback to basic URL
          const fallbackUrl = PanoramaService.getPanoramaUrl(result);
          buttons.push({
            provider: result.provider,
            url: fallbackUrl
          });
        }
      }
      
      setProviderButtons(buttons);
    };

    generateOptimizedUrls();
  }, [detectionResults]);

  // Effect for appearance animation
  useEffect(() => {
    if (screenPosition) {
      // Small delay to trigger animation
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [screenPosition]);

  // Don't render if we don't have the screen position yet
  if (!map || !screenPosition) {
    return null;
  }

  // If no provider is available
  if (providerButtons.length === 0) {
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
  
  // Otherwise, display available providers
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
        {providerButtons.map((button) => (
          <a
            key={button.provider}
            href={button.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '12px',
              borderRadius: '8px',
                          background: '#fefbf1', // Same color as popup background
            border: '1px solid rgba(155, 68, 52, 0.1)',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            width: '80px', // Fixed width for all providers
            minHeight: '70px' // Minimum height to avoid variations
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
                src={`/images/providers/${button.provider}.svg`}
                alt={`${button.provider} Logo`}
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
              {button.provider === 'google' && 'Google'}
              {button.provider === 'bing' && 'Bing'}
              {button.provider === 'yandex' && 'Yandex'}
              {button.provider === 'apple' && 'Apple'}
              {button.provider === 'naver' && 'Naver'}
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
      
              {/* Arrow pointing to the exact position */}
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