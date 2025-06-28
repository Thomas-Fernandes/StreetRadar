/**
 * Street View detection service using Canvas API for visual tile analysis.
 * Detects only the presence of tiles from providers
 * Cleaned version without visual debug display
 */

import L from 'leaflet';

/**
 * Interface for detection results
 */
export interface StreetViewDetectionResult {
  provider: 'google' | 'bing' | 'yandex' | 'apple';
  available: boolean;
  closestPoint?: L.LatLng;
  distance?: number;
  tileUrl?: string;   // URL of found tile (useful for console debug only)
}

/**
 * Interface for provider-specific detection parameters
 */
interface ProviderDetectionConfig {
  name: 'google' | 'bing' | 'yandex' | 'apple';
  urlPattern: string;
}

/**
 * Class for Street View detection by tile presence
 */
export class StreetViewDetectionCanvas {
  // Detection configuration for each provider
  private static providerConfigs: ProviderDetectionConfig[] = [
    {
      name: 'google',
      urlPattern: 'googleapis.com'
    },
    {
      name: 'bing',
      urlPattern: 'virtualearth.net'
    },
    {
      name: 'yandex',
      urlPattern: 'yandex.net'
    },
    {
      name: 'apple',
      urlPattern: 'streetradar.app'
    }
  ];

  /**
   * Detects available Street View tiles at a given location
   * Cleaned version without visual debug
   */
  static async detectStreetViewAt(
    map: L.Map, 
    latlng: L.LatLng, 
    activeProviders: string[]
  ): Promise<StreetViewDetectionResult[]> {
    const results: StreetViewDetectionResult[] = [];
    
    // Only process active providers
    const activeConfigs = this.providerConfigs.filter(
      config => activeProviders.includes(config.name)
    );
    
    // For each active provider
    for (const config of activeConfigs) {
      try {
        // Initialize result for this provider
        const result: StreetViewDetectionResult = {
          provider: config.name,
          available: false
        };
        
        // Specialized logic for Apple MVT Layer
        if (config.name === 'apple') {
          // For Apple, since it's enabled in the panel, we consider it available
          // (simplified logic as Apple MVT layer has a different architecture)
          result.available = true;
          result.closestPoint = latlng;
          result.distance = 0;
          result.tileUrl = 'Apple MVT Layer Active';
        } else {
          // Standard logic for other providers
          const tileInfo = this.findTileForProvider(map, latlng, config);
          
          if (tileInfo) {
            // If a tile is found, consider the panorama available
            result.available = true;
                          result.closestPoint = latlng; // Use click position as panorama position
            result.distance = 0;
            result.tileUrl = tileInfo.imgElement.src;
          }
        }
        
        results.push(result);
      } catch (error) {
        console.error(`Error during detection for ${config.name}:`, error);
        results.push({
          provider: config.name,
          available: false
        });
      }
    }
    
    return results;
  }

  /**
   * Finds the tile and image element for a specific provider
   * at the click location - CLEANED VERSION
   */
  private static findTileForProvider(
    map: L.Map,
    latlng: L.LatLng,
    config: ProviderDetectionConfig
  ): {
    imgElement: HTMLImageElement;
    tileCoords: { x: number; y: number; z: number };
    clickPositionOnTile: { x: number; y: number };
  } | null {
    let result: {
      imgElement: HTMLImageElement;
      tileCoords: { x: number; y: number; z: number };
      clickPositionOnTile: { x: number; y: number };
    } | null = null;
  
    // Iterate through all layers on the map
    map.eachLayer((layer: L.Layer) => {
      // Check if it's a tile layer corresponding to the provider
      const tileLayer = layer as L.TileLayer & { 
        _url?: string; 
        _tiles?: Record<string, { coords: { x: number; y: number; z: number }; el: HTMLImageElement; complete: boolean }> 
      };
      
      if (
        tileLayer._url && 
        tileLayer._url.includes(config.urlPattern) && 
        tileLayer._tiles && 
        !result
      ) {
        const zoom = map.getZoom();
        
        // Use Leaflet methods to convert directly
        const point = map.project(latlng, zoom);
        const tileCoords = {
          x: Math.floor(point.x / 256),
          y: Math.floor(point.y / 256),
          z: zoom
        };
        
        // Find the tile in the layer cache
        for (const key in tileLayer._tiles) {
          const tile = tileLayer._tiles[key];
          
          // If we find a tile that matches our coordinates
          if (
            tile.coords.x === tileCoords.x && 
            tile.coords.y === tileCoords.y && 
            tile.coords.z === tileCoords.z && 
            tile.el && 
            tile.el.complete
          ) {
            // Calculate click position inside the tile (in pixels)
            const clickPositionOnTile = {
              x: Math.floor(point.x % 256),
              y: Math.floor(point.y % 256)
            };
            
            result = {
              imgElement: tile.el,
              tileCoords,
              clickPositionOnTile
            };
            
            // REMOVED ALL VISUAL DEBUG DISPLAY
            // No more debugDiv, no more visual elements created in the DOM
            
            return result;
          }
        }
      }
      return null;
    });
  
    return result;
  }

  /**
   * Converts geographic coordinates to pixel coordinates on the map
   */
  private static latLngToTilePoint(latlng: L.LatLng, zoom: number): L.Point {
    const projectedPoint = L.CRS.EPSG3857.latLngToPoint(latlng, zoom);
    return projectedPoint.multiplyBy(Math.pow(2, zoom) * 256 / 256);
  }

  /**
   * Checks if the Apple MVT layer is present and active on the map
   * (Method for future use - currently not used)
   */
  private static checkAppleMVTLayer(map: L.Map): boolean {
    let hasAppleMVTLayer = false;
    
    map.eachLayer((layer: L.Layer) => {
        // Check if it's the Apple MVT layer (AppleMVTLayer)
  // We can identify the layer by its attribution or properties
      const layerWithOptions = layer as L.Layer & { 
        options?: { attribution?: string };
        getTileJSONMetadata?: () => unknown;
      };
      
      if (layerWithOptions.options?.attribution?.includes('Apple Look Around') ||
          layerWithOptions.getTileJSONMetadata) {
        hasAppleMVTLayer = true;
      }
    });
    
    return hasAppleMVTLayer;
  }

  /**
   * Creates an identification key for a tile
   */
  private static getTileId(coords: { x: number; y: number; z: number }): string {
    return `${coords.x}:${coords.y}:${coords.z}`;
  }
}