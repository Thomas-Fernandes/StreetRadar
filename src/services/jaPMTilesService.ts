/**
 * Service for handling ja.is PMTiles integration
 * 
 * This service provides access to ja.is (Iceland) panorama coverage data
 * stored as a PMTiles file on the CDN, using range requests for efficient loading.
 */

export interface TileJSONMetadata {
  tilejson: string;
  name?: string;
  description?: string;
  version?: string;
  attribution?: string;
  template?: string;
  legend?: string;
  scheme?: string;
  tiles: string[];
  grids?: string[];
  data?: string[];
  minzoom?: number;
  maxzoom?: number;
  bounds?: [number, number, number, number];
  center?: [number, number, number];
  fillzoom?: number;
  vector_layers?: Array<{
    id: string;
    description?: string;
    minzoom?: number;
    maxzoom?: number;
    fields: Record<string, string>;
  }>;
}

export class JaPMTilesService {
  private static readonly BASE_URL = 'https://tiles.streetradar.app';
  private static readonly PMTILES_URL = `${JaPMTilesService.BASE_URL}/ja360.pmtiles`;
  
  // Cache to avoid repeating calls
  private static tileJSONCache: TileJSONMetadata | null = null;
  private static tileJSONPromise: Promise<TileJSONMetadata> | null = null;

  /**
   * Gets the direct URL to the ja360.pmtiles file
   * 
   * @returns The direct URL to the PMTiles file
   */
  static getPMTilesUrl(): string {
    return JaPMTilesService.PMTILES_URL;
  }

  /**
   * Retrieves TileJSON metadata from ja360.pmtiles
   * 
   * This method calls the TileJSON endpoint only once at startup
   * and caches the result to avoid repeated calls.
   * 
   * @returns Promise<TileJSONMetadata> The PMtiles metadata
   * @throws Error If the TileJSON call fails
   */
  static async getTileJSON(): Promise<TileJSONMetadata> {
    // If we already have data in cache, return it
    if (JaPMTilesService.tileJSONCache) {
      return JaPMTilesService.tileJSONCache;
    }

    // If a call is already in progress, wait for its result
    if (JaPMTilesService.tileJSONPromise) {
      return JaPMTilesService.tileJSONPromise;
    }

    // Launch a new TileJSON call
    JaPMTilesService.tileJSONPromise = JaPMTilesService.fetchTileJSON();
    
    try {
      const result = await JaPMTilesService.tileJSONPromise;
      JaPMTilesService.tileJSONCache = result;
      return result;
    } catch (error) {
      // In case of error, clean up promise to allow retry
      JaPMTilesService.tileJSONPromise = null;
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
      const response = await fetch(`${JaPMTilesService.BASE_URL}/tiles/ja.json`);
      
      if (!response.ok) {
        throw new Error(`TileJSON HTTP error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validation of required fields
      if (!data.tilejson || !Array.isArray(data.tiles)) {
        throw new Error('Invalid TileJSON: missing required fields');
      }

      return data as TileJSONMetadata;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch ja.is TileJSON: ${error.message}`);
      }
      throw new Error('Failed to fetch ja.is TileJSON: Unknown error');
    }
  }

  /**
   * Gets attribution text for ja.is
   * 
   * @returns Attribution string
   */
  static getAttribution(): string {
    return '© ja.is - Iceland Street View';
  }
}
