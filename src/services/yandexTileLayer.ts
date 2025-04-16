/**
 * yandexTileLayer.ts
 * 
 * Extension de TileLayer de Leaflet spécifique à Yandex Panoramas.
 * 
 * Cette classe étend le TileLayer standard de Leaflet pour gérer
 * la projection EPSG:3395 utilisée par Yandex. Elle effectue les conversions
 * nécessaires entre les systèmes de coordonnées pour afficher correctement
 * les tuiles de couverture des panoramas Yandex sur la carte.
 * 
 * La principale complexité vient du fait que Yandex utilise une projection de Mercator
 * légèrement différente (EPSG:3395) de celle utilisée par Leaflet (EPSG:3857).
 */

import L from 'leaflet';
import proj4 from 'proj4';

// Définir les projections nécessaires pour la conversion
proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs');
proj4.defs('EPSG:3395', '+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs');

/**
 * Type pour les options du YandexTileLayer
 */
export type YandexTileLayerOptions = L.TileLayerOptions;

/**
 * Classe pour créer une couche de tuiles Yandex Panoramas avec support de la projection EPSG:3395
 */
export class YandexTileLayer extends L.TileLayer {
  private urlTemplate: string;

  constructor(urlTemplate: string, options?: YandexTileLayerOptions) {
    super(urlTemplate, options);
    this.urlTemplate = urlTemplate;
  }

  /**
   * Surchargé de la classe parent pour gérer la conversion de projection
   * 
   * Cette méthode convertit les coordonnées de tuile standard (EPSG:3857)
   * vers le système utilisé par Yandex (EPSG:3395) avant de construire l'URL.
   */
  getTileUrl(coords: L.Coords): string {
    const z = coords.z;
    let x = coords.x;
    let y = coords.y;
    
    // Pour les zooms faibles, la différence entre les projections est négligeable
    if (z < 5) {
      return L.Util.template(this.urlTemplate, { x, y, z });
    }
    
    try {
      // Convertir les coordonnées de tuile en coordonnées géographiques
      const n = Math.pow(2, z);
      const lng = (x / n) * 360 - 180;
      const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180 / Math.PI;
      
      // Convertir entre les deux systèmes de projection
      const point3857 = proj4('EPSG:3857', [lng, lat]);
      const point3395 = proj4('EPSG:3857', 'EPSG:3395', point3857);
      
      // Calculer les indices de tuile dans la projection de Yandex
      const earthRadius3395 = 6378137.0;
      const earthCircumference3395 = 2 * Math.PI * earthRadius3395;
      const metersPerPixel3395 = earthCircumference3395 / (256 * Math.pow(2, z));
      
      const tileSize = 256;
      const xPixel3395 = (point3395[0] + earthCircumference3395/2) / metersPerPixel3395;
      const yPixel3395 = (earthCircumference3395/2 - point3395[1]) / metersPerPixel3395;
      
      x = Math.floor(xPixel3395 / tileSize);
      y = Math.floor(yPixel3395 / tileSize);
    } catch (error) {
      console.error("Erreur de conversion de projection pour Yandex:", error);
      // En cas d'erreur, utiliser les coordonnées originales
    }
    
    return L.Util.template(this.urlTemplate, { x, y, z });
  }
}

/**
 * Fonction d'aide pour créer une instance YandexTileLayer
 * 
 * @param urlTemplate - Le modèle d'URL pour les tuiles Yandex
 * @param options - Options supplémentaires pour le TileLayer
 * @returns Une nouvelle instance de YandexTileLayer
 */
export function createYandexTileLayer(urlTemplate: string, options?: YandexTileLayerOptions): YandexTileLayer {
  return new YandexTileLayer(urlTemplate, options);
}