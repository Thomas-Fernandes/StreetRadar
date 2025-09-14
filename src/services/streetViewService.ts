/**
 * Service dedicated to managing tile URLs for different Street View coverage layers.
 *
 * This service centralizes the URL generation logic for different Street View
 * providers (Google, Apple, Bing, etc.). It provides static methods
 * that return appropriate URL templates for each provider, which components
 * can then use to display coverage layers.
 *
 * Generated URLs are formatted to be compatible with Leaflet which will replace
 * the {x}, {y}, and {z} variables with appropriate coordinates and zoom level.
 */

export class StreetViewService {
  /**
   * Generates URL for Google Street View coverage tiles
   *
   * This URL displays the blue lines indicating where Street View is available
   * Variables {x}, {y}, {z} will be replaced by Leaflet
   * with appropriate coordinates and zoom level.
   * 
   * @returns URL template for Google Street View coverage tiles
   */
  static getGoogleStreetViewTileUrl(): string {
    // This URL comes from an analysis of Google Maps functionality
    // Parameters include configurations to specifically display Street View lines
    return 'https://maps.googleapis.com/maps/vt?pb=!1m7!8m6!1m3!1i{z}!2i{x}!3i{y}!2i9!3x1!2m8!1e2!2ssvv!4m2!1scc!2s*211m3*211e2*212b1*213e2*212b1*214b1!4m2!1ssvl!2s*211b0*212b1!3m8!2sen!3sus!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m4!1e0!8m2!1e1!1e1!6m6!1e12!2i2!11e0!39b0!44e0!50e0';
  }

  /**
   * Generates URL for Apple Look Around coverage tiles
   *
   * This method now returns a special identifier to indicate that we need to
   * use the custom MVT layer instead of a standard TileLayer.
   *
   * @returns Special identifier for Apple MVT layer
   */
  static getAppleLookAroundTileUrl(): string {
    // Return a special identifier to indicate MVT layer usage
    return 'APPLE_MVT_LAYER';
  }

  /**
   * Generates URL for Bing Streetside coverage tiles
   *
   * This URL displays the purple lines indicating where Streetside is available.
   * It uses Bing Maps' quadkey system to identify tiles.
   * 
   * @returns URL template for Bing Streetside coverage tiles
   */
  static getBingStreetsideTileUrl(): string {
    // This URL was identified through network analysis and matches the format used by Bing Maps
    // The {q} notation will be replaced by a custom TileLayer that converts coordinates to quadkey
    return 'https://t.ssl.ak.dynamic.tiles.virtualearth.net/comp/ch/{q}?mkt=fr-FR&it=Z,HC&n=t&og=2651&sv=9.36';
  }

  /**
   * Converts tile coordinates (x, y, z) to Bing Maps quadkey
   *
   * The quadkey is a notation system used by Bing Maps where each tile is identified
   * by a unique string of digits 0-3, each representing a quadrant at each zoom level.
   *
   * @param x - The X coordinate of the tile
   * @param y - The Y coordinate of the tile
   * @param z - The zoom level
   * @returns The quadkey corresponding to the coordinates
   */
  static tileXYToQuadKey(x: number, y: number, z: number): string {
    let quadKey = '';
    for (let i = z; i > 0; i--) {
      let digit = 0;
      const mask = 1 << (i - 1);
      if ((x & mask) !== 0) {
        digit += 1;
      }
      if ((y & mask) !== 0) {
        digit += 2;
      }
      quadKey += digit;
    }
    return quadKey;
  }

  /**
   * Generates URL for Yandex Panoramas coverage tiles
   *
   * This URL displays the lines indicating where Yandex Panoramas is available
   * 
   * @returns URL template for Yandex Panoramas coverage tiles
   */
  static getYandexPanoramasTileUrl(): string {
    return 'https://04.core-stv-renderer.maps.yandex.net/2.x/tiles?l=stv,sta&x={x}&y={y}&z={z}&scale=1&v=2025.04.14.22.49-1_25.04.11-0-24374&lang=en_UA&format=png&client_id=yandex-web-maps';
  }

  /**
   * Generates URL for Naver Street View coverage tiles
   *
   * This method returns a special identifier to indicate that we need to
   * use the custom MVT layer instead of a standard TileLayer.
   *
   * @returns Special identifier for Naver MVT layer
   */
  static getNaverStreetViewTileUrl(): string {
    // Return a special identifier to indicate MVT layer usage
    return 'NAVER_MVT_LAYER';
  }

  /**
   * Generates URL for ja.is coverage tiles
   *
   * This URL displays the coverage indicating where ja.is panoramas are available.
   * Since ja.is uses PNG tiles, we use a standard TileLayer.
   * 
   * @returns URL template for ja.is coverage tiles
   */
  static getJaIsTileUrl(): string {
    // URL pattern for ja.is tiles hosted on tiles.streetradar.app
    return 'https://tiles.streetradar.app/tiles/ja/{z}/{x}/{y}.png';
  }
}