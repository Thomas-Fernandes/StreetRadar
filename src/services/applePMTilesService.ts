/**
 * ApplePMTilesService.ts
 * 
 * Service dedicated to managing Apple Look Around PMtiles.
 * 
 * This service handles interaction with the PMtiles CDN hosted on tiles.streetradar.app
 * and provides methods to retrieve TileJSON and build MVT tile URLs.
 * It follows best practices by never downloading the complete 6 GB archive.
 */

export interface TileJSONMetadata {
  tilejson: string;
  name?: string;
  description?: string;
  version?: string;
  attribution?: string;
  scheme?: string;
  tiles: string[];
  minzoom: number;
  maxzoom: number;
  bounds?: [number, number, number, number];
  center?: [number, number, number];
  vector_layers?: Array<{
    id: string;
    description?: string;
    minzoom?: number;
    maxzoom?: number;
    fields?: { [key: string]: string };
  }>;
}

export class ApplePMTilesService {
  private static readonly BASE_URL = 'https://tiles.streetradar.app';
  private static readonly TILEJSON_URL = `${ApplePMTilesService.BASE_URL}/tiles.json`;
  private static readonly MVT_URL_TEMPLATE = `${ApplePMTilesService.BASE_URL}/tiles/{z}/{x}/{y}.mvt`;
  
  // Cache to avoid repeating TileJSON call every time
  private static tileJSONCache: TileJSONMetadata | null = null;
  private static tileJSONPromise: Promise<TileJSONMetadata> | null = null;

  /**
   * Retrieves TileJSON metadata from Apple PMtiles
   * 
   * This method calls the TileJSON endpoint only once at startup
   * and caches the result to avoid repeated calls.
   * 
   * @returns Promise<TileJSONMetadata> The PMtiles metadata
   * @throws Error If the TileJSON call fails
   */
  static async getTileJSON(): Promise<TileJSONMetadata> {
    // If we already have data in cache, return it
    if (ApplePMTilesService.tileJSONCache) {
      return ApplePMTilesService.tileJSONCache;
    }

    // If a call is already in progress, wait for its result
    if (ApplePMTilesService.tileJSONPromise) {
      return ApplePMTilesService.tileJSONPromise;
    }

    // Launch a new TileJSON call
    ApplePMTilesService.tileJSONPromise = ApplePMTilesService.fetchTileJSON();
    
    try {
      const result = await ApplePMTilesService.tileJSONPromise;
      ApplePMTilesService.tileJSONCache = result;
      return result;
    } catch (error) {
      // In case of error, clean up promise to allow retry
      ApplePMTilesService.tileJSONPromise = null;
      throw error;
    }
  }

  /**
   * Performs HTTP call to retrieve TileJSON
   * 
   * @returns Promise<TileJSONMetadata> The PMtiles metadata
   * @throws Error If the HTTP call fails
   */
  private static async fetchTileJSON(): Promise<TileJSONMetadata> {
    try {
      const response = await fetch(ApplePMTilesService.TILEJSON_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`TileJSON request failed: ${response.status} ${response.statusText}`);
      }

      const tileJSON: TileJSONMetadata = await response.json();
      
      // Validation of essential data
      if (!tileJSON.tiles || !Array.isArray(tileJSON.tiles) || tileJSON.tiles.length === 0) {
        throw new Error('Invalid TileJSON: missing or empty tiles array');
      }

      if (typeof tileJSON.minzoom !== 'number' || typeof tileJSON.maxzoom !== 'number') {
        throw new Error('Invalid TileJSON: missing or invalid zoom levels');
      }

      return tileJSON;
    } catch (error) {
      console.error('Failed to fetch Apple PMtiles TileJSON:', error);
      throw new Error(`Unable to load Apple PMtiles metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generates URL for a specific MVT tile
   * 
   * @param x - X coordinate of the tile
   * @param y - Y coordinate of the tile
   * @param z - Zoom level
   * @returns The complete MVT tile URL
   */
  static getMVTTileUrl(x: number, y: number, z: number): string {
    return ApplePMTilesService.MVT_URL_TEMPLATE
      .replace('{x}', x.toString())
      .replace('{y}', y.toString())
      .replace('{z}', z.toString());
  }

  /**
   * Generates URL template for Leaflet
   * 
   * @returns The URL template with {x}, {y}, {z} placeholders
   */
  static getMVTUrlTemplate(): string {
    return ApplePMTilesService.MVT_URL_TEMPLATE;
  }

  /**
   * Checks if a zoom level is valid according to PMtiles limits
   * 
   * @param zoom - The zoom level to check
   * @param tileJSON - TileJSON metadata (optional, will be retrieved if not provided)
   * @returns Promise<boolean> True if zoom is valid
   */
  static async isZoomLevelValid(zoom: number, tileJSON?: TileJSONMetadata): Promise<boolean> {
    const metadata = tileJSON || await ApplePMTilesService.getTileJSON();
    return zoom >= metadata.minzoom && zoom <= metadata.maxzoom;
  }

  /**
   * Retrieves zoom limits from PMtiles
   * 
   * @returns Promise<{minzoom: number, maxzoom: number}> The zoom limits
   */
  static async getZoomLimits(): Promise<{minzoom: number, maxzoom: number}> {
    const tileJSON = await ApplePMTilesService.getTileJSON();
    return {
      minzoom: tileJSON.minzoom,
      maxzoom: tileJSON.maxzoom
    };
  }

  /**
   * Clears the cache (useful for tests or reloading)
   */
  static clearCache(): void {
    ApplePMTilesService.tileJSONCache = null;
    ApplePMTilesService.tileJSONPromise = null;
  }
} 