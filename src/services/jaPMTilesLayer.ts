/**
 * Custom Leaflet layer for ja.is PMTiles integration
 * 
 * This layer uses the PMTiles library to efficiently load PNG tiles
 * from a single .pmtiles file using HTTP range requests.
 */

import * as L from 'leaflet';
import { PMTiles, FetchSource } from 'pmtiles';
import { JaPMTilesService } from './jaPMTilesService';

export type JaPMTilesLayerOptions = L.TileLayerOptions;

/**
 * Custom TileLayer that loads tiles from a PMTiles file
 */
export class JaPMTilesLayer extends L.TileLayer {
  private pmtiles: PMTiles | null = null;
  private isInitialized = false;

  constructor(options?: JaPMTilesLayerOptions) {
    // Initialize with empty URL template since we'll handle tile loading ourselves
    super('', options);
    this.initializePMTiles();
  }

  /**
   * Initialize the PMTiles instance
   */
  private async initializePMTiles(): Promise<void> {
    try {
      const pmtilesUrl = JaPMTilesService.getPMTilesUrl();
      const source = new FetchSource(pmtilesUrl);
      this.pmtiles = new PMTiles(source);
      this.isInitialized = true;
      
      // If the layer is already added to a map, refresh it
      if (this._map) {
        this.redraw();
      }
    } catch (error) {
      console.error('Failed to initialize ja.is PMTiles:', error);
    }
  }

  /**
   * Override the createTile method to load tiles from PMTiles
   */
  createTile(coords: L.Coords, done: L.DoneCallback): HTMLElement {
    const tile = document.createElement('img');
    
    if (!this.isInitialized || !this.pmtiles) {
      // If not initialized yet, return empty tile and retry later
      setTimeout(() => {
        if (this.isInitialized && this.pmtiles) {
          this.loadPMTile(tile, coords, done);
        } else {
          done(new Error('PMTiles not initialized'), tile);
        }
      }, 100);
      return tile;
    }

    this.loadPMTile(tile, coords, done);
    return tile;
  }

  /**
   * Load a specific tile from PMTiles
   */
  private async loadPMTile(
    tile: HTMLImageElement, 
    coords: L.Coords, 
    done: L.DoneCallback
  ): Promise<void> {
    try {
      if (!this.pmtiles) {
        throw new Error('PMTiles not initialized');
      }

      // Get the tile data from PMTiles
      const tileResult = await this.pmtiles.getZxy(coords.z, coords.x, coords.y);
      
      if (!tileResult) {
        // No tile data available for these coordinates
        done(new Error('No tile data'), tile);
        return;
      }

      // Convert ArrayBuffer to Blob and create object URL
      const blob = new Blob([tileResult.data], { type: 'image/png' });
      const objectUrl = URL.createObjectURL(blob);
      
      // Set up tile loading
      tile.onload = () => {
        URL.revokeObjectURL(objectUrl);
        done(undefined, tile);
      };
      
      tile.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        done(new Error('Failed to load tile image'), tile);
      };
      
      tile.src = objectUrl;
      
    } catch (error) {
      console.error('Error loading PMTile:', error);
      done(error as Error, tile);
    }
  }

  /**
   * Override onRemove to clean up resources
   */
  onRemove(map: L.Map): this {
    // Clean up PMTiles resources if needed
    if (this.pmtiles) {
      // PMTiles doesn't seem to have explicit cleanup methods,
      // but we can null the reference
      this.pmtiles = null;
    }
    return super.onRemove(map);
  }
}

/**
 * Factory function to create a ja.is PMTiles layer
 */
export function createJaPMTilesLayer(options?: JaPMTilesLayerOptions): JaPMTilesLayer {
  return new JaPMTilesLayer({
    maxZoom: 19,
    opacity: 0.9,
    pane: 'overlayPane',
    attribution: JaPMTilesService.getAttribution(),
    ...options
  });
}
