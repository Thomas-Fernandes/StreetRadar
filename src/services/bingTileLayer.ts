/**
 * Bing Maps specific Leaflet TileLayer extension.
 *
 * This class extends Leaflet's standard TileLayer to handle
 * Bing Maps' specific quadkey system. It replaces the {q} variable
 * in the URL with the corresponding quadkey calculated from x,y,z coordinates.
 */

import L from 'leaflet';
import { StreetViewService } from './streetViewService';

/**
 * Interface for BingTileLayer specific options
 */
// Use L.TileLayerOptions directly since no specific options are needed for now
export type BingTileLayerOptions = L.TileLayerOptions;

/**
 * Class to create a Bing Maps tile layer with quadkey support
 */
export class BingTileLayer extends L.TileLayer {
  constructor(urlTemplate: string, options?: BingTileLayerOptions) {
    // We will use a different approach to handle quadkeys
    // Replace {q} with {z}/{x}/{y} to intercept it in createTile
    const modifiedUrl = urlTemplate.replace('{q}', '{z}/{x}/{y}');
    super(modifiedUrl, options);
    
    // Save original URL for reference
    this.originalUrl = urlTemplate;
    this.hasQuadKey = urlTemplate.indexOf('{q}') !== -1;
  }

  private originalUrl: string;
  private hasQuadKey: boolean;

  /**
   * Overridden from parent class to handle quadkeys
   */
  getTileUrl(coords: L.Coords): string {
    if (this.hasQuadKey) {
      // For URLs that use quadkeys
      const quadKey = StreetViewService.tileXYToQuadKey(coords.x, coords.y, coords.z);
      return this.originalUrl.replace('{q}', quadKey);
    } else {
      // Use default implementation for other URLs
      return super.getTileUrl(coords);
    }
  }
}

/**
 * Helper function to create a BingTileLayer instance
 *
 * @param urlTemplate - The URL template for tiles
 * @param options - Additional options for the TileLayer
 * @returns BingTileLayer instance
 */
export function createBingTileLayer(urlTemplate: string, options?: BingTileLayerOptions): BingTileLayer {
  return new BingTileLayer(urlTemplate, options);
}