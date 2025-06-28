/**
 * apple-protobuf.ts
 * 
 * Définitions TypeScript pour les structures protobuf Apple Look Around
 * Basé sur les schémas découverts dans la librairie Python streetlevel
 */

/**
 * Interface pour la CameraFrame dans MuninViewState
 */
export interface CameraFrame {
  latitude: number;   // Latitude en degrés
  longitude: number;  // Longitude en degrés  
  altitude: number;   // Altitude en mètres
  yaw: number;        // Direction horizontale en degrés
  pitch: number;      // Inclinaison verticale en degrés
  roll: number;       // Rotation en degrés
}

/**
 * Interface pour MuninViewState principal
 */
export interface MuninViewState {
  cameraFrame: CameraFrame;
}

/**
 * Interface pour les coordonnées de tuile
 */
export interface TilePosition {
  x_offset: number;   // Offset X dans la tuile (0-64)
  y_offset: number;   // Offset Y dans la tuile (0-64)
  yaw: number;        // Yaw brut (0-16383)
  pitch: number;      // Pitch brut (0-16383)
  roll: number;       // Roll brut (0-16383)
  altitude: number;   // Altitude du panorama
}

/**
 * Interface pour les données de panorama dans GroundMetadataTile
 */
export interface PanoramaData {
  tile_position: TilePosition;
  build_id?: number;  // ID de construction
  pano_id?: string;   // Identifiant unique du panorama
}

/**
 * Interface pour GroundMetadataTile
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
 * Constantes pour les conversions Apple
 */
export const APPLE_CONSTANTS = {
  TILE_SIZE: 256,
  COVERAGE_ZOOM: 17,
  RAW_ANGLE_MAX: 16383,  // Maximum pour yaw/pitch/roll bruts
  TWO_PI: 2 * Math.PI
} as const;

/**
 * URLs et en-têtes pour l'API Apple
 */
export const APPLE_API = {
  TILE_BASE_URL: 'https://gspe76-ssl.ls.apple.com/api/tile',
  HEADERS: {
    'maps-tile-style': 'style=57&size=2&scale=0&v=0&preflight=2',
    'maps-auth-token': 'w31CPGRO/n7BsFPh8X7kZnFG0LDj9pAuR8nTtH3xhH8='
  }
} as const; 