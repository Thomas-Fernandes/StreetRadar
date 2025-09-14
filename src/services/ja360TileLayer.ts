/**
 * ja360TileLayer.ts
 * 
 * Leaflet TileLayer extension specific to ja360 (Japanese 360-degree street view service).
 * 
 * This class extends Leaflet's standard TileLayer to handle
 * ja360's specific tile serving system and coordinate transformations
 * if needed for proper display of ja360 street view coverage.
 */

import L from 'leaflet';

/**
 * Type for ja360TileLayer options
 */
export type Ja360TileLayerOptions = L.TileLayerOptions;

/**
 * Class to create a ja360 tile layer
 */
export class Ja360TileLayer extends L.TileLayer {
  private urlTemplate: string;

  constructor(urlTemplate: string, options?: Ja360TileLayerOptions) {
    super(urlTemplate, options);
    this.urlTemplate = urlTemplate;
  }

  /**
   * Overridden from parent class to handle ja360 specific URL formatting
   * 
   * This method can be customized if ja360 uses a different tile coordinate
   * system or requires special URL parameters.
   */
  getTileUrl(coords: L.Coords): string {
    const z = coords.z;
    const x = coords.x;
    const y = coords.y;
    
    // For now, use standard tile coordinate system
    // This can be modified if ja360 requires specific coordinate transformations
    return L.Util.template(this.urlTemplate, { x, y, z });
  }
}

/**
 * Helper function to create a ja360TileLayer instance
 * 
 * @param urlTemplate - The URL template for ja360 tiles
 * @param options - Additional options for the TileLayer
 * @returns A new ja360TileLayer instance
 */
export function createJa360TileLayer(urlTemplate: string, options?: Ja360TileLayerOptions): Ja360TileLayer {
  return new Ja360TileLayer(urlTemplate, options);
}