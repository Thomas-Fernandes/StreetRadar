/**
 * Panorama detection and URL generation service
 *
 * Temporary simplified version that focuses only on tile detection.
 * Uses StreetViewDetectionCanvas for actual detection.
 */

import L from 'leaflet';
import { StreetViewDetectionCanvas, StreetViewDetectionResult } from './streetViewDetectionCanvas';
import { AppleLookAroundService } from './appleLookAroundService';
import { NaverStreetViewService } from './naverStreetViewService';

/**
 * Interface for detection options
 */
export interface PanoramaDetectionOptions {
  method: 'canvas' | 'api';  // Detection method to use
  showDebugInfo?: boolean;   // Show debug information
}

/**
 * Service principal for panorama management
 */
export class PanoramaService {
  /**
   * Detects available panoramas at a given location
   *
   * This method uses tile-based detection via StreetViewDetectionCanvas.
   * @param latlng Geographic position where to search for panoramas
   * @param map Leaflet map instance for tile access
   * @param _options Detection options (not used for now)
   * @returns Promise with detection results
   */
  static async detectPanoramasAt(
    map: L.Map,
    latlng: L.LatLng,
    activeProviders: string[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: PanoramaDetectionOptions = { method: 'canvas' }
  ): Promise<StreetViewDetectionResult[]> {
    // For now, use only the Canvas method
    return StreetViewDetectionCanvas.detectStreetViewAt(
      map,
      latlng,
      activeProviders
    );
  }

  /**
   * Generates URL to open a panorama for a specific provider
   *
   * @param result Detection result for a provider
   * @param latlng Geographic coordinates
   * @returns URL to open the panorama
   */
  static getPanoramaUrl(result: StreetViewDetectionResult): string {
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
        // Use Apple Look Around service to generate an optimized link
        return AppleLookAroundService.buildOptimizedLookAroundLink(
          parseFloat(lat), 
          parseFloat(lng)
        );
      
      case 'naver':
        // For Naver, return fallback URL synchronously 
        // The proper panorama link will be generated asynchronously
        return `https://map.naver.com/v5/search/${lat},${lng}`;
      
      case 'ja':
        return `https://ja.is/kort/#${lat},${lng}`;
      
      default:
        return '#';
    }
  }

  /**
   * Generates an optimized URL to open a panorama for a specific provider
   * This async version can fetch real panorama data for better links
   *
   * @param result Detection result for a provider
   * @returns Promise<string> Optimized URL to open the panorama
   */
  static async getOptimizedPanoramaUrl(result: StreetViewDetectionResult): Promise<string> {
    if (!result.closestPoint) return '#';
    
    const lat = result.closestPoint.lat;
    const lng = result.closestPoint.lng;
    
    switch (result.provider) {
      case 'google':
        return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat.toFixed(6)},${lng.toFixed(6)}`;
      
      case 'bing':
        return `https://www.bing.com/maps?cp=${lat.toFixed(6)}~${lng.toFixed(6)}&lvl=19&style=x`;
      
      case 'yandex':
        return `https://yandex.com/maps/?panorama%5Bpoint%5D=${lng.toFixed(6)}%2C${lat.toFixed(6)}&l=stv`;
      
      case 'apple':
        // Use Apple Look Around service to generate an optimized link
        return AppleLookAroundService.buildOptimizedLookAroundLink(lat, lng);
      
      case 'naver':
        // Use the new NaverStreetViewService for direct panorama links
        return NaverStreetViewService.buildOptimizedNaverLink(lat, lng);
      
      case 'ja':
        return `https://ja.is/kort/#${lat.toFixed(6)},${lng.toFixed(6)}`;
      
      default:
        return '#';
    }
  }

  /**
   * Returns the full name of a provider from its identifier
   * 
   * @param provider Provider identifier
   * @returns Full provider name
   */
  static getProviderName(provider: string): string {
    switch (provider) {
      case 'google': return 'Google Street View';
      case 'bing': return 'Bing Streetside';
      case 'yandex': return 'Yandex Panoramas';
      case 'apple': return 'Apple Look Around';
      case 'naver': return 'Naver Street View';
      case 'ja': return 'Já 360 Street View';
      default: return provider;
    }
  }
}