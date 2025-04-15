/**
 * bingTileLayer.ts
 * 
 * Extension de TileLayer de Leaflet spécifique à Bing Maps.
 * 
 * Cette classe étend le TileLayer standard de Leaflet pour gérer
 * le système de quadkey spécifique à Bing Maps. Elle remplace la variable {q}
 * dans l'URL par le quadkey correspondant calculé à partir des coordonnées x,y,z.
 */

import L from 'leaflet';
import { StreetViewService } from './streetViewService';

/**
 * Interface pour les options spécifiques à BingTileLayer
 */
// Utiliser directement L.TileLayerOptions puisqu'aucune option spécifique n'est nécessaire pour le moment
export type BingTileLayerOptions = L.TileLayerOptions;

/**
 * Classe pour créer une couche de tuiles Bing Maps avec support des quadkeys
 */
export class BingTileLayer extends L.TileLayer {
  constructor(urlTemplate: string, options?: BingTileLayerOptions) {
    // Nous allons utiliser une approche différente pour gérer les quadkeys
    // Remplacer {q} par {z}/{x}/{y} pour pouvoir l'intercepter dans createTile
    const modifiedUrl = urlTemplate.replace('{q}', '{z}/{x}/{y}');
    super(modifiedUrl, options);
    
    // Sauvegarder l'URL d'origine pour référence
    this.originalUrl = urlTemplate;
    this.hasQuadKey = urlTemplate.indexOf('{q}') !== -1;
  }

  private originalUrl: string;
  private hasQuadKey: boolean;

  /**
   * Surchargé de la classe parent pour gérer les quadkeys
   */
  getTileUrl(coords: L.Coords): string {
    if (this.hasQuadKey) {
      // Pour les URLs qui utilisent des quadkeys
      const quadKey = StreetViewService.tileXYToQuadKey(coords.x, coords.y, coords.z);
      return this.originalUrl.replace('{q}', quadKey);
    } else {
      // Utiliser l'implémentation par défaut pour les autres URLs
      return super.getTileUrl(coords);
    }
  }
}

/**
 * Fonction d'aide pour créer une instance BingTileLayer
 * 
 * @param urlTemplate - Le modèle d'URL pour les tuiles
 * @param options - Options supplémentaires pour le TileLayer
 * @returns Une nouvelle instance de BingTileLayer
 */
export function createBingTileLayer(urlTemplate: string, options?: BingTileLayerOptions): BingTileLayer {
  return new BingTileLayer(urlTemplate, options);
}