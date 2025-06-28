/**
 * yandexTileLayer.ts
 * 
 * Leaflet TileLayer extension specific to Yandex Panoramas.
 * 
 * This class extends Leaflet's standard TileLayer to handle
 * the EPSG:3395 projection used by Yandex. It performs the necessary
 * conversions between coordinate systems to correctly display
 * Yandex panorama coverage tiles on the map.
 * 
 * The main complexity comes from the fact that Yandex uses a slightly
 * different Mercator projection (EPSG:3395) than the one used by Leaflet (EPSG:3857).
 */

import L from 'leaflet';
import proj4 from 'proj4';

// Define necessary projections for conversion
proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs');
proj4.defs('EPSG:3395', '+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs');

/**
 * Type for YandexTileLayer options
 */
export type YandexTileLayerOptions = L.TileLayerOptions;

/**
 * Class to create a Yandex Panoramas tile layer with EPSG:3395 projection support
 */
export class YandexTileLayer extends L.TileLayer {
  private urlTemplate: string;

  constructor(urlTemplate: string, options?: YandexTileLayerOptions) {
    super(urlTemplate, options);
    this.urlTemplate = urlTemplate;
  }

  /**
   * Overridden from parent class to handle projection conversion
   * 
   * This method converts standard tile coordinates (EPSG:3857)
   * to the system used by Yandex (EPSG:3395) before building the URL.
   */
  getTileUrl(coords: L.Coords): string {
    const z = coords.z;
    let x = coords.x;
    let y = coords.y;
    
    // For low zooms, the difference between projections is negligible
    if (z < 5) {
      return L.Util.template(this.urlTemplate, { x, y, z });
    }
    
    try {
      // Convert tile coordinates to geographic coordinates
      const n = Math.pow(2, z);
      const lng = (x / n) * 360 - 180;
      const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180 / Math.PI;
      
      // Convert between the two projection systems
      const point3857 = proj4('EPSG:3857', [lng, lat]);
      const point3395 = proj4('EPSG:3857', 'EPSG:3395', point3857);
      
      // Calculate tile indices in Yandex projection
      const earthRadius3395 = 6378137.0;
      const earthCircumference3395 = 2 * Math.PI * earthRadius3395;
      const metersPerPixel3395 = earthCircumference3395 / (256 * Math.pow(2, z));
      
      const tileSize = 256;
      const xPixel3395 = (point3395[0] + earthCircumference3395/2) / metersPerPixel3395;
      const yPixel3395 = (earthCircumference3395/2 - point3395[1]) / metersPerPixel3395;
      
      x = Math.floor(xPixel3395 / tileSize);
      y = Math.floor(yPixel3395 / tileSize);
    } catch (error) {
      console.error("Projection conversion error for Yandex:", error);
      // In case of error, use original coordinates
    }
    
    return L.Util.template(this.urlTemplate, { x, y, z });
  }
}

/**
 * Helper function to create a YandexTileLayer instance
 * 
 * @param urlTemplate - The URL template for Yandex tiles
 * @param options - Additional options for the TileLayer
 * @returns A new YandexTileLayer instance
 */
export function createYandexTileLayer(urlTemplate: string, options?: YandexTileLayerOptions): YandexTileLayer {
  return new YandexTileLayer(urlTemplate, options);
}