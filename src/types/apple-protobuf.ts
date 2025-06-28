/**
 * TypeScript definitions for Apple Look Around protobuf structures
 * Based on schemas discovered in the Python streetlevel library
 */

/**
 * Interface for CameraFrame in MuninViewState
 */
export interface CameraFrame {
    latitude: number;   // Latitude in degrees
  longitude: number;  // Longitude in degrees
  altitude: number;   // Altitude in meters
  yaw: number;        // Horizontal direction in degrees
  pitch: number;      // Vertical tilt in degrees
  roll: number;       // Rotation in degrees
}

/**
 * Interface for main MuninViewState
 */
export interface MuninViewState {
  cameraFrame: CameraFrame;
}

/**
 * Interface for tile coordinates
 */
export interface TilePosition {
  x_offset: number;   // X offset in tile (0-64)
  y_offset: number;   // Y offset in tile (0-64)
  yaw: number;        // Raw yaw (0-16383)
  pitch: number;      // Raw pitch (0-16383)
  roll: number;       // Raw roll (0-16383)
  altitude: number;   // Panorama altitude
}

/**
 * Interface for panorama data in GroundMetadataTile
 */
export interface PanoramaData {
  tile_position: TilePosition;
  build_id?: number;  // Construction ID
  pano_id?: string;   // Unique panorama identifier
}

/**
 * Interface for GroundMetadataTile
 */
export interface GroundMetadataTile {
  tile_coordinate: {
    x: number;
    y: number;
    z: number;
  };
  pano: PanoramaData[];
  build_table?: Array<{
    build_id: number;
    [key: string]: unknown;
  }>;
}

/**
 * Constants for Apple conversions
 */
export const APPLE_CONSTANTS = {
  TILE_SIZE: 256,
  COVERAGE_ZOOM: 17,
  RAW_ANGLE_MAX: 16383,  // Maximum for raw yaw/pitch/roll
  TWO_PI: 2 * Math.PI
} as const;

/**
 * URLs and headers for Apple API
 */
export const APPLE_API = {
  TILE_BASE_URL: 'https://gspe76-ssl.ls.apple.com/api/tile',
  HEADERS: {
    'maps-tile-style': 'style=57&size=2&scale=0&v=0&preflight=2',
    'maps-auth-token': 'w31CPGRO/n7BsFPh8X7kZnFG0LDj9pAuR8nTtH3xhH8='
  }
} as const; 