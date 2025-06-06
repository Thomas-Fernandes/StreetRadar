/**
 * panoramaService.ts
 * 
 * Service responsable de la gestion des liens vers les panoramas Street View
 * Version simplifiée temporaire qui se concentre uniquement sur la détection des tuiles.
 */

import L from 'leaflet';
import { StreetViewDetectionCanvas, StreetViewDetectionResult } from './streetViewDetectionCanvas';

/**
 * Interface pour les options de détection
 */
export interface PanoramaDetectionOptions {
  method: 'canvas' | 'api';  // Méthode de détection à utiliser
  showDebugInfo?: boolean;   // Afficher les informations de débogage
}

/**
 * Service principal pour la gestion des panoramas
 */
export class PanoramaService {
  /**
   * Détecte les panoramas disponibles à un emplacement donné
   * 
   * @param map La carte Leaflet
   * @param latlng Position géographique où chercher des panoramas
   * @param activeProviders Liste des fournisseurs actifs
   * @param options Options de détection
   * @returns Promesse avec les résultats de détection
   */
  static async detectPanoramasAt(
    map: L.Map,
    latlng: L.LatLng,
    activeProviders: string[],
    options: PanoramaDetectionOptions = { method: 'canvas' }
  ): Promise<StreetViewDetectionResult[]> {
    // Pour l'instant, utiliser uniquement la méthode Canvas
    return StreetViewDetectionCanvas.detectStreetViewAt(
      map,
      latlng,
      activeProviders
    );
  }

  /**
   * Génère l'URL pour ouvrir un panorama chez un fournisseur spécifique
   * 
   * @param result Résultat de détection pour un fournisseur
   * @returns URL vers le panorama
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
        // Apple n'a pas d'URL publique pour Look Around, rediriger vers Maps
        return `https://maps.apple.com/?ll=${lat},${lng}&spn=0.001,0.001`;
      
      default:
        return '#';
    }
  }

  /**
   * Retourne le nom complet d'un fournisseur à partir de son identifiant
   * 
   * @param provider Identifiant du fournisseur
   * @returns Nom complet du fournisseur
   */
  static getProviderName(provider: string): string {
    switch (provider) {
      case 'google': return 'Google Street View';
      case 'bing': return 'Bing Streetside';
      case 'yandex': return 'Yandex Panoramas';
      case 'apple': return 'Apple Look Around';
      default: return provider;
    }
  }
}