/**
 * Custom Leaflet layer for Apple Look Around PMTiles integration
 * 
 * This layer uses the PMTiles library to efficiently load vector tiles
 * from a single .pmtiles file using HTTP range requests.
 */

import * as L from 'leaflet';
import { PMTiles, FetchSource } from 'pmtiles';
import { ApplePMTilesService } from './applePMTilesService';

export type ApplePMTilesLayerOptions = L.GridLayerOptions & {
  style?: {
    color?: string;
    weight?: number;
    opacity?: number;
  };
};

/**
 * Custom GridLayer that loads vector tiles from a PMTiles file
 * and renders them as coverage lines
 */
export class ApplePMTilesLayerNew extends L.GridLayer {
  private pmtiles: PMTiles | null = null;
  private isInitialized = false;
  private style: Required<NonNullable<ApplePMTilesLayerOptions['style']>>;

  constructor(options?: ApplePMTilesLayerOptions) {
    super(options);
    
    // Default style for Apple Look Around coverage
    this.style = {
      color: options?.style?.color || '#e74c3c',
      weight: options?.style?.weight || 2,
      opacity: options?.style?.opacity || 0.8
    };
    
    this.initializePMTiles();
  }

  /**
   * Initialize the PMTiles instance
   */
  private async initializePMTiles(): Promise<void> {
    try {
      const pmtilesUrl = ApplePMTilesService.getPMTilesUrl();
      const source = new FetchSource(pmtilesUrl);
      this.pmtiles = new PMTiles(source);
      this.isInitialized = true;
      
      // If the layer is already added to a map, refresh it
      if (this._map) {
        this.redraw();
      }
    } catch (error) {
      console.error('Failed to initialize Apple PMTiles:', error);
    }
  }

  /**
   * Override the createTile method to load and render vector tiles from PMTiles
   */
  createTile(coords: L.Coords, done: L.DoneCallback): HTMLElement {
    const tile = document.createElement('canvas');
    tile.width = this.getTileSize().x;
    tile.height = this.getTileSize().y;
    
    if (!this.isInitialized || !this.pmtiles) {
      // If not initialized yet, return empty tile and retry later
      setTimeout(() => {
        if (this.isInitialized && this.pmtiles) {
          this.loadAndRenderPMTile(tile, coords, done);
        } else {
          done(new Error('PMTiles not initialized'), tile);
        }
      }, 100);
      return tile;
    }

    this.loadAndRenderPMTile(tile, coords, done);
    return tile;
  }

  /**
   * Load and render a vector tile from PMTiles
   */
  private async loadAndRenderPMTile(
    tile: HTMLCanvasElement, 
    coords: L.Coords, 
    done: L.DoneCallback
  ): Promise<void> {
    try {
      if (!this.pmtiles) {
        throw new Error('PMTiles not initialized');
      }

      // Get the vector tile data from PMTiles
      const tileResult = await this.pmtiles.getZxy(coords.z, coords.x, coords.y);
      
      if (!tileResult) {
        // No tile data available for these coordinates
        done(undefined, tile);
        return;
      }

      // Render the vector tile data onto the canvas
      await this.renderVectorTile(tile, tileResult.data);
      done(undefined, tile);
      
    } catch (error) {
      console.error('Error loading Apple PMTile:', error);
      done(error as Error, tile);
    }
  }

  /**
   * Render vector tile data onto canvas
   */
  private async renderVectorTile(
    canvas: HTMLCanvasElement, 
    data: ArrayBuffer
  ): Promise<void> {
    try {
      // Import vector tile parsing libraries
      const VectorTile = (await import('@mapbox/vector-tile')).VectorTile;
      const Pbf = (await import('pbf')).default;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Parse vector tile
      const tile = new VectorTile(new Pbf(data));
      
      // Set up canvas styling
      ctx.strokeStyle = this.style.color;
      ctx.lineWidth = this.style.weight;
      ctx.globalAlpha = this.style.opacity;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Get tile bounds
      const tileSize = this.getTileSize().x;
      const scale = tileSize / 4096; // MVT uses 4096 extent

      // Iterate through layers in the vector tile
      for (const layerName of Object.keys(tile.layers)) {
        const layer = tile.layers[layerName];
        
        // Render each feature in the layer
        for (let i = 0; i < layer.length; i++) {
          const feature = layer.feature(i);
          const geometry = feature.loadGeometry();
          
          if (feature.type === 2) { // LineString
            this.renderLineString(ctx, geometry, scale);
          }
        }
      }
      
    } catch (error) {
      console.error('Error rendering Apple vector tile:', error);
    }
  }

  /**
   * Render a LineString geometry on canvas
   */
  private renderLineString(
    ctx: CanvasRenderingContext2D, 
    geometry: Array<Array<{x: number; y: number}>>, 
    scale: number
  ): void {
    for (const ring of geometry) {
      if (ring.length < 2) continue;
      
      ctx.beginPath();
      
      for (let i = 0; i < ring.length; i++) {
        const point = ring[i];
        const x = point.x * scale;
        const y = point.y * scale;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
    }
  }

  /**
   * Override onRemove to clean up resources
   */
  onRemove(map: L.Map): this {
    // Clean up PMTiles resources if needed
    if (this.pmtiles) {
      this.pmtiles = null;
    }
    return super.onRemove(map);
  }
}

/**
 * Factory function to create an Apple PMTiles layer
 */
export function createApplePMTilesLayer(options?: ApplePMTilesLayerOptions): ApplePMTilesLayerNew {
  return new ApplePMTilesLayerNew({
    maxZoom: 19,
    opacity: 0.9,
    pane: 'overlayPane',
    attribution: ApplePMTilesService.getAttribution(),
    ...options
  });
}
