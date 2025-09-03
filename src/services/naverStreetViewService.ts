/**
 * NaverStreetViewService.ts
 * 
 * Service for interacting with Naver Street View API to fetch panorama metadata
 * and generate direct links to panoramas.
 * 
 * Inspired by the streetlevel library implementation for Naver Street View.
 */

export interface NaverPanoramaData {
  id: string;
  lat: number;
  lon: number;
  heading?: number;
  pitch?: number;
  fov?: number;
  date?: string;
  title?: string;
  description?: string;
}

export interface NaverApiResponse {
  features?: Array<{
    geometry: {
      coordinates: [number, number];
    };
    properties: {
      id: string;
      heading?: number;
      pitch?: number;
      [key: string]: unknown;
    };
  }>;
  error?: string;
}

export class NaverStreetViewService {
  private static readonly NAVER_API_BASE = 'https://map.naver.com/p/api/panorama/nearby';
  private static readonly NAVER_MAP_BASE = 'https://map.naver.com/p';

  /**
   * Searches for a Naver Street View panorama near the given coordinates
   * 
   * Note: Direct API access is blocked by CORS in browsers.
   * This method currently returns null to trigger fallback behavior.
   * 
   * @param lat Latitude
   * @param lon Longitude
   * @returns Promise<NaverPanoramaData | null> Panorama data if found, null otherwise
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async findPanoramaNear(_lat: number, _lon: number): Promise<NaverPanoramaData | null> {
    // CORS Issue: Direct browser requests to Naver API are blocked
    // For now, we'll skip the API call and return null to use fallback URLs
    // 
    // In a production environment, you would need either:
    // 1. A backend proxy to make the API call
    // 2. Server-side rendering for the initial request
    // 3. Use Naver's official JavaScript SDK (if available)
    
    console.debug('Naver API call skipped due to CORS restrictions. Using fallback URL.');
    return null;

    /* 
    // Original implementation (commented out due to CORS):
    try {
      const url = `${this.NAVER_API_BASE}/${lon}/${lat}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Referer': 'https://map.naver.com',
          'User-Agent': 'Mozilla/5.0 (compatible; StreetRadar/1.0)',
        },
      });

      if (!response.ok) {
        console.warn(`Naver API returned ${response.status}: ${response.statusText}`);
        return null;
      }

      const data: NaverApiResponse = await response.json();

      if (data.error || !data.features || data.features.length === 0) {
        return null;
      }

      // Get the closest panorama
      const feature = data.features[0];
      const [panoLon, panoLat] = feature.geometry.coordinates;
      const properties = feature.properties;

      return {
        id: properties.id,
        lat: panoLat,
        lon: panoLon,
        heading: properties.heading || 0,
        pitch: properties.pitch || 0,
        fov: 80, // Default FOV
      };
    } catch (error) {
      console.error('Error fetching Naver panorama:', error);
      return null;
    }
    */
  }

  /**
   * Builds a direct permalink to a Naver Street View panorama
   * 
   * @param panoramaData The panorama data
   * @param heading Optional heading override (in degrees)
   * @param pitch Optional pitch override (in degrees)
   * @param fov Optional field of view override (in degrees)
   * @param mapZoom Optional map zoom level
   * @returns Direct link to the panorama
   */
  static buildPanoramaLink(
    panoramaData: NaverPanoramaData,
    heading?: number,
    pitch?: number,
    fov?: number,
    mapZoom: number = 17
  ): string {
    const finalHeading = heading !== undefined ? heading : (panoramaData.heading || 0);
    const finalPitch = pitch !== undefined ? pitch : (panoramaData.pitch || 10);
    const finalFov = fov !== undefined ? fov : (panoramaData.fov || 80);

    // Format: https://map.naver.com/p?c=mapZoom,0,0,0,adh&p=panoid,heading,pitch,fov,Float
    return `${this.NAVER_MAP_BASE}?c=${mapZoom},0,0,0,adh&p=${panoramaData.id},${finalHeading},${finalPitch},${finalFov},Float`;
  }

  /**
   * Generates a direct Naver Street View link for given coordinates
   * This method combines panorama search and link generation
   * 
   * @param lat Latitude
   * @param lon Longitude
   * @param heading Optional heading in degrees
   * @param pitch Optional pitch in degrees
   * @param fov Optional field of view in degrees
   * @returns Promise<string> Direct link to panorama or fallback search URL
   */
  static async generateDirectLink(
    lat: number,
    lon: number,
    heading?: number,
    pitch?: number,
    fov?: number
  ): Promise<string> {
    try {
      const panoramaData = await this.findPanoramaNear(lat, lon);
      
      if (panoramaData) {
        return this.buildPanoramaLink(panoramaData, heading, pitch, fov);
      } else {
        // Fallback to search URL if no panorama found
        return this.buildFallbackSearchUrl(lat, lon);
      }
    } catch (error) {
      console.error('Error generating Naver direct link:', error);
      return this.buildFallbackSearchUrl(lat, lon);
    }
  }

  /**
   * Builds a fallback search URL for when no panorama is found
   * 
   * @param lat Latitude
   * @param lon Longitude
   * @returns Naver Maps search URL
   */
  private static buildFallbackSearchUrl(lat: number, lon: number): string {
    return `https://map.naver.com/v5/search/${lat.toFixed(6)},${lon.toFixed(6)}`;
  }

  /**
   * Validates if coordinates are within South Korea (where Naver Street View is available)
   * 
   * @param lat Latitude
   * @param lon Longitude
   * @returns boolean True if coordinates are likely in South Korea
   */
  static isInSouthKorea(lat: number, lon: number): boolean {
    // Rough bounding box for South Korea
    return lat >= 33.0 && lat <= 38.6 && lon >= 124.5 && lon <= 131.9;
  }

  /**
   * Generates an optimized Naver Street View link with fallback logic
   * 
   * @param lat Latitude
   * @param lon Longitude
   * @returns Promise<string> Best available link for the location
   */
  static async buildOptimizedNaverLink(lat: number, lon: number): Promise<string> {
    // Due to CORS restrictions, we'll use an enhanced search URL
    // that's more likely to show Street View if available
    
    if (this.isInSouthKorea(lat, lon)) {
      // For South Korea, use a more specific URL format that encourages Street View
      return this.buildEnhancedSearchUrl(lat, lon);
    } else {
      // For locations outside South Korea, use standard search URL
      return this.buildFallbackSearchUrl(lat, lon);
    }
  }

  /**
   * Builds an enhanced search URL that's more likely to trigger Street View
   * 
   * @param lat Latitude
   * @param lon Longitude
   * @returns Enhanced Naver Maps URL
   */
  private static buildEnhancedSearchUrl(lat: number, lon: number): string {
    // Use a format that's more likely to trigger Street View mode
    // This URL format includes specific parameters that encourage panorama mode
    const baseUrl = 'https://map.naver.com/v5/search';
    const coords = `${lat.toFixed(6)},${lon.toFixed(6)}`;
    
    // Add parameters to encourage Street View opening
    const params = new URLSearchParams({
      'c': `${lat.toFixed(6)},${lon.toFixed(6)},15,0,0,0,dh`, // Location with zoom and direction
      'type': '0' // Map type
    });

    return `${baseUrl}/${coords}?${params.toString()}`;
  }
}
