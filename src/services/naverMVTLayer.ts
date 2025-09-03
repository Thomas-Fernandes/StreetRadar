/**
 * Custom Leaflet layer to manage the display of Naver Street View MVT vector tiles.
 *
 * This layer extends Leaflet's GridLayer to create custom tiles that fetch
 * and display vector data in MVT format from the PMtiles CDN.
 * It handles 200 (data), 204 (empty tile) and 404 (out of bounds) responses.
 */

import L from 'leaflet';
import { NaverPMTilesService, TileJSONMetadata } from './naverPMTilesService';
import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';

/**
 * Options for the MVT Naver layer
 */
export interface NaverMVTLayerOptions extends L.GridLayerOptions {
  style?: {
    color?: string;
    weight?: number;
    opacity?: number;
  };
}

/**
 * Custom layer to display Naver MVT vector tiles
 */
export class NaverMVTLayer extends L.GridLayer {
  private tileJSONMetadata: TileJSONMetadata | null = null;
  private styleOptions: {
    color: string;
    weight: number;
    opacity: number;
  };

  constructor(options: NaverMVTLayerOptions = {}) {
    // Default layer configuration
    const defaultOptions: L.GridLayerOptions = {
      maxZoom: 16,
      minZoom: 3,
      tileSize: 256,
      ...options
    };

    super(defaultOptions);

    // Default style for Naver LineStrings
    this.styleOptions = {
      color: '#00c851', // Green color for Naver
      weight: 2,
      opacity: 0.8,
      ...options.style
    };

    // Clear cache to use final URLs (tiles.streetradar.app)
    NaverPMTilesService.clearCache();
    
    // Initialize TileJSON metadata
    this.initializeTileJSON();
  }

  /**
   * Initializes TileJSON metadata asynchronously
   */
  private async initializeTileJSON(): Promise<void> {
    // Temporarily, use default values directly
    // because the TileJSON endpoint is not yet available
    
    this.tileJSONMetadata = {
      tilejson: "2.2.0",
      tiles: [NaverPMTilesService.getMVTUrlTemplate()],
      minzoom: 3,
      maxzoom: 16,
      attribution: "© Naver Street View"
    };
    
    // Update options with default limits
    (this.options as L.GridLayerOptions).minZoom = 3;
    (this.options as L.GridLayerOptions).maxZoom = 16;
    
    if (this._map) {
      this.redraw();
    }
  }

  /**
   * Creates a custom tile to display MVT data
   * This method is called by Leaflet for each visible tile
   */
  createTile(coords: L.Coords, done: L.DoneCallback): HTMLElement {
    // Create canvas element to draw LineStrings
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Set canvas size based on tileSize
    const tileSize = this.getTileSize();
    canvas.width = tileSize.x;
    canvas.height = tileSize.y;

    // Retrieve and display MVT data asynchronously
    this.loadAndRenderMVTData(canvas, ctx, coords, done);

    return canvas;
  }

  /**
   * Loads and displays MVT data for a given tile
   */
  private async loadAndRenderMVTData(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    coords: L.Coords,
    done: L.DoneCallback
  ): Promise<void> {
    try {
      // Check if zoom is within limits before making the call
      if (this.tileJSONMetadata) {
        if (coords.z < this.tileJSONMetadata.minzoom || coords.z > this.tileJSONMetadata.maxzoom) {
          // Out of bounds: don't make call
          done(undefined, canvas);
          return;
        }
      }

      // Build MVT tile URL
      const url = NaverPMTilesService.getMVTTileUrl(coords.x, coords.y, coords.z);
      
      // Retrieve MVT tile
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/x-protobuf'
        }
      });

      if (response.status === 204) {
        // Empty tile: draw nothing
        done(undefined, canvas);
        return;
      }

      if (response.status === 404) {
        // Out of bounds: draw nothing
        done(undefined, canvas);
        return;
      }

      if (!response.ok) {
        throw new Error(`MVT request failed: ${response.status} ${response.statusText}`);
      }

      // Retrieve binary MVT data
      const arrayBuffer = await response.arrayBuffer();
      
      // Parse and display MVT data
      await this.renderMVTData(ctx, arrayBuffer, coords);
      
      done(undefined, canvas);
    } catch (error) {
      // Silent error handling for production
      done(error as Error, canvas);
    }
  }

  /**
   * Parses and displays MVT data on the canvas
   *
   * This method parses the actual MVT vector data and displays the LineStrings.
   */
  private async renderMVTData(
    ctx: CanvasRenderingContext2D,
    arrayBuffer: ArrayBuffer,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _coords: L.Coords
  ): Promise<void> {
    try {
      // Drawing style configuration
      ctx.strokeStyle = this.styleOptions.color;
      ctx.lineWidth = this.styleOptions.weight;
      ctx.globalAlpha = this.styleOptions.opacity;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Parse MVT data
      const tile = new VectorTile(new Protobuf(arrayBuffer));
      
      // Iterate through all layers in the MVT tile
      for (const layerName in tile.layers) {
        const layer = tile.layers[layerName];
        
        // Iterate through all features in the layer
        for (let i = 0; i < layer.length; i++) {
          const feature = layer.feature(i);
          
          // Only process LineStrings (type 2)
          if (feature.type === 2) {
            const geometry = feature.loadGeometry();
            
            // Draw each ring of the geometry
            for (const ring of geometry) {
              if (ring.length < 2) continue; // Ignore rings with less than 2 points
              
              ctx.beginPath();
              
              // Draw the line
              for (let j = 0; j < ring.length; j++) {
                const point = ring[j];
                
                // Convert tile coordinates (0-4096) to canvas pixels (0-256)
                const x = (point.x / 4096) * 256;
                const y = (point.y / 4096) * 256;
                
                if (j === 0) {
                  ctx.moveTo(x, y);
                } else {
                  ctx.lineTo(x, y);
                }
              }
              
              ctx.stroke();
            }
          }
        }
      }
      
      // Features rendered successfully (debug info removed for production)

    } catch {
      // Silent error handling for production - no visual error indicator
    }
  }

  /**
   * Updates the layer style
   */
  setStyle(style: Partial<NaverMVTLayerOptions['style']>): this {
    this.styleOptions = {
      ...this.styleOptions,
      ...style
    };
    
    // Redraw the layer if it is on a map
    if (this._map) {
      this.redraw();
    }
    
    return this;
  }

  /**
   * Retrieves TileJSON metadata
   */
  getTileJSONMetadata(): TileJSONMetadata | null {
    return this.tileJSONMetadata;
  }
}

/**
 * Factory function to create a NaverMVTLayer instance
 */
export function createNaverMVTLayer(options?: NaverMVTLayerOptions): NaverMVTLayer {
  return new NaverMVTLayer(options);
}
