/**
 * ApplePMTilesService.ts
 * 
 * Service dédié à la gestion des tuiles PMtiles d'Apple Look Around.
 * 
 * Ce service gère l'interaction avec le CDN PMtiles hébergé sur tiles.streetradar.app
 * et fournit des méthodes pour récupérer le TileJSON et construire les URLs des tuiles MVT.
 * Il respecte les bonnes pratiques en ne téléchargeant jamais l'archive complète de 6 Go.
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
  
  // Cache pour éviter de refaire l'appel TileJSON à chaque fois
  private static tileJSONCache: TileJSONMetadata | null = null;
  private static tileJSONPromise: Promise<TileJSONMetadata> | null = null;

  /**
   * Récupère les métadonnées TileJSON du PMtiles d'Apple
   * 
   * Cette méthode appelle l'endpoint TileJSON une seule fois au démarrage
   * et met en cache le résultat pour éviter les appels répétés.
   * 
   * @returns Promise<TileJSONMetadata> Les métadonnées du PMtiles
   * @throws Error Si l'appel TileJSON échoue
   */
  static async getTileJSON(): Promise<TileJSONMetadata> {
    // Si on a déjà les données en cache, les retourner
    if (ApplePMTilesService.tileJSONCache) {
      return ApplePMTilesService.tileJSONCache;
    }

    // Si un appel est déjà en cours, attendre son résultat
    if (ApplePMTilesService.tileJSONPromise) {
      return ApplePMTilesService.tileJSONPromise;
    }

    // Lancer un nouvel appel TileJSON
    ApplePMTilesService.tileJSONPromise = ApplePMTilesService.fetchTileJSON();
    
    try {
      const result = await ApplePMTilesService.tileJSONPromise;
      ApplePMTilesService.tileJSONCache = result;
      return result;
    } catch (error) {
      // En cas d'erreur, nettoyer la promesse pour permettre un nouvel essai
      ApplePMTilesService.tileJSONPromise = null;
      throw error;
    }
  }

  /**
   * Effectue l'appel HTTP pour récupérer le TileJSON
   * 
   * @returns Promise<TileJSONMetadata> Les métadonnées du PMtiles
   * @throws Error Si l'appel HTTP échoue
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
      
      // Validation des données essentielles
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
   * Génère l'URL pour une tuile MVT spécifique
   * 
   * @param x - Coordonnée X de la tuile
   * @param y - Coordonnée Y de la tuile
   * @param z - Niveau de zoom
   * @returns L'URL complète de la tuile MVT
   */
  static getMVTTileUrl(x: number, y: number, z: number): string {
    return ApplePMTilesService.MVT_URL_TEMPLATE
      .replace('{x}', x.toString())
      .replace('{y}', y.toString())
      .replace('{z}', z.toString());
  }

  /**
   * Génère le template d'URL pour Leaflet
   * 
   * @returns Le template d'URL avec les placeholders {x}, {y}, {z}
   */
  static getMVTUrlTemplate(): string {
    return ApplePMTilesService.MVT_URL_TEMPLATE;
  }

  /**
   * Vérifie si un niveau de zoom est valide selon les limites du PMtiles
   * 
   * @param zoom - Le niveau de zoom à vérifier
   * @param tileJSON - Les métadonnées TileJSON (optionnel, sera récupéré si non fourni)
   * @returns Promise<boolean> True si le zoom est valide
   */
  static async isZoomLevelValid(zoom: number, tileJSON?: TileJSONMetadata): Promise<boolean> {
    const metadata = tileJSON || await ApplePMTilesService.getTileJSON();
    return zoom >= metadata.minzoom && zoom <= metadata.maxzoom;
  }

  /**
   * Récupère les limites de zoom du PMtiles
   * 
   * @returns Promise<{minzoom: number, maxzoom: number}> Les limites de zoom
   */
  static async getZoomLimits(): Promise<{minzoom: number, maxzoom: number}> {
    const tileJSON = await ApplePMTilesService.getTileJSON();
    return {
      minzoom: tileJSON.minzoom,
      maxzoom: tileJSON.maxzoom
    };
  }

  /**
   * Nettoie le cache (utile pour les tests ou le rechargement)
   */
  static clearCache(): void {
    ApplePMTilesService.tileJSONCache = null;
    ApplePMTilesService.tileJSONPromise = null;
  }
} 