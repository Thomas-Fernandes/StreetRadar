/**
 * PLACEHOLDER for Street View panorama detection via API
 *
 * This file is a template that explains how to implement detection
 * via API calls instead of visual analysis.
 *
 * DIFFERENCE WITH streetViewDetectionCanvas.ts:
 * - streetViewDetectionCanvas.ts analyzes TILES already loaded on the map
 *   using the Canvas API to visually detect Street View lines.
 * - This file would make DIRECT API CALLS to providers
 *   to verify the existence of panoramas at requested coordinates.
 *
 * ADVANTAGES:
 * - More precise: returns exact position of panoramas
 * - More reliable: doesn't depend on visual analysis which can be fragile
 * - More information: can obtain additional metadata about panoramas
 *
 * DISADVANTAGES:
 * - Requires API keys for most providers
 * - Slower: requires additional HTTP requests
 */

import L from 'leaflet';

/**
 * Interface for detection results (identical to Canvas one)
 */
export interface StreetViewDetectionResult {
  provider: 'google' | 'bing' | 'yandex' | 'apple';
  available: boolean;
  closestPoint?: L.LatLng;
  distance?: number;
  panoId?: string;      // Unique panorama ID (useful for creating direct links)
  heading?: number;     // Camera direction towards click point
  metadata?: Record<string, unknown>;       // Additional panorama metadata
}

/**
 * Configuration of APIs for each provider
 */
interface ProviderAPIConfig {
  name: 'google' | 'bing' | 'yandex' | 'apple';
  apiKey?: string;      // Required API key
  searchRadius: number; // Search radius in meters
  maxResults: number;   // Maximum number of results to return
}

/**
 * Main class for Street View detection via API
 */
export class StreetViewDetectionAPI {
  /**
   * Default API configuration
   * To complete with actual API keys in a .env file
   */
  private static providerConfigs: ProviderAPIConfig[] = [
    {
      name: 'google',
      // apiKey: process.env.GOOGLE_MAPS_API_KEY,
      searchRadius: 50,
      maxResults: 1
    },
    {
      name: 'bing',
      // apiKey: process.env.BING_MAPS_API_KEY,
      searchRadius: 50,
      maxResults: 1
    },
    {
      name: 'yandex',
      // apiKey: process.env.YANDEX_API_KEY,
      searchRadius: 50,
      maxResults: 1
    },
    {
      name: 'apple',
      // apiKey: process.env.APPLE_MAPS_API_KEY,
      searchRadius: 50,
      maxResults: 1
    }
  ];

  /**
   * Detects available Street View panoramas at a given location
   * using official provider APIs
   * 
   * @param latlng The point where user clicked/dropped the cat
   * @param activeProviders List of active providers on the map
   * @returns Promise with detection results for each provider
   */
  static async detectStreetViewAt(
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
        let result: StreetViewDetectionResult = {
          provider: config.name,
          available: false
        };
        
        // Call appropriate method based on provider
        switch (config.name) {
          case 'google':
            result = await this.checkGoogleStreetView(latlng, config);
            break;
          case 'bing':
            result = await this.checkBingStreetside(latlng, config);
            break;
          case 'yandex':
            result = await this.checkYandexPanoramas(latlng, config);
            break;
          case 'apple':
            result = await this.checkAppleLookAround(latlng, config);
            break;
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
   * Checks availability of a Google Street View panorama
   * 
   * IMPLEMENTATION:
   * - Uses Google Street View Metadata API
   * - Endpoint: https://maps.googleapis.com/maps/api/streetview/metadata
   * - Documentation: https://developers.google.com/maps/documentation/streetview/metadata
   */
  private static async checkGoogleStreetView(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    latlng: L.LatLng,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    config: ProviderAPIConfig
  ): Promise<StreetViewDetectionResult> {
    // Code to implement based on streetlevel project
    // Example request:
    // const url = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${latlng.lat},${latlng.lng}&radius=${config.searchRadius}&key=${config.apiKey}`;
    // const response = await fetch(url);
    // const data = await response.json();
    
    // To implement:
    // 1. Check response status (OK = panorama available)
    // 2. Extract exact coordinates, panorama ID, etc.
    // 3. Calculate distance between click and panorama

    return {
      provider: 'google',
      available: false, // To be replaced with real logic
    };
  }

  /**
   * Checks availability of a Bing Streetside panorama
   * 
   * IMPLEMENTATION:
   * - Uses Bing Maps Imagery API
   * - Detection is more complex as there's no direct API
   * - Will be inspired by the streetlevel project that implements this logic
   */
  private static async checkBingStreetside(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    latlng: L.LatLng,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    config: ProviderAPIConfig
  ): Promise<StreetViewDetectionResult> {
    // Code to implement based on streetlevel project
    // See: https://github.com/sk-zk/streetlevel/blob/master/streetlevel/streetview/bing.py
    
    return {
      provider: 'bing',
      available: false, // To be replaced with real logic
    };
  }

  /**
   * Checks availability of a Yandex panorama
   * 
   * IMPLEMENTATION:
   * - Uses Yandex Maps API
   * - Will be inspired by the streetlevel project that implements this logic
   */
  private static async checkYandexPanoramas(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    latlng: L.LatLng,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    config: ProviderAPIConfig
  ): Promise<StreetViewDetectionResult> {
    // Code to implement based on streetlevel project
    // See: https://github.com/sk-zk/streetlevel/blob/master/streetlevel/streetview/yandex.py
    
    return {
      provider: 'yandex',
      available: false, // To be replaced with real logic
    };
  }

  /**
   * Checks availability of an Apple Look Around panorama
   * 
   * IMPLEMENTATION:
   * - This feature will be more difficult as Apple has no public API
   * - Will be inspired by the streetlevel project if it implements this feature
   */
  private static async checkAppleLookAround(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    latlng: L.LatLng,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    config: ProviderAPIConfig
  ): Promise<StreetViewDetectionResult> {
    // To research if an API or method is available
    
    return {
      provider: 'apple',
      available: false, // To be replaced with real logic
    };
  }

  /**
   * NOTES FOR ADAPTING FROM STREETLEVEL:
   * 
   * The streetlevel project (https://github.com/sk-zk/streetlevel) contains
   * Python implementations for panorama detection via API for
   * multiple providers. To adapt this code to Next.js:
   * 
   * 1. Study HTTP request logic in Python files
   * 2. Adapt requests to use fetch() instead of Python libraries
   * 3. Keep response processing logic
   * 4. Adapt result format to our StreetViewDetectionResult interface
   * 
   * STREETLEVEL MODULES TO ADAPT:
   * - google.py: Relatively simple, uses official API
   * - bing.py: More complex, requires multiple requests
   * - yandex.py: Poorly documented API, rely on existing implementation
   * 
   * FOR EACH PROVIDER, WE WILL NEED TO:
   * 1. Build appropriate request URL
   * 2. Handle specific headers and parameters
   * 3. Parse JSON/XML response
   * 4. Extract coordinates, ID and other metadata
   * 5. Calculate distance and format result
   */
}