/**
 * streetViewDetectionCanvas.ts
 * 
 * Détecte uniquement la présence de tuiles des fournisseurs
 * Version nettoyée sans affichage de debug visuel
 */

import L from 'leaflet';

/**
 * Interface pour les résultats de détection
 */
export interface StreetViewDetectionResult {
  provider: 'google' | 'bing' | 'yandex' | 'apple';
  available: boolean;
  closestPoint?: L.LatLng;
  distance?: number;
  tileUrl?: string;   // URL de la tuile trouvée (utile pour le debug console uniquement)
}

/**
 * Interface pour les paramètres de détection spécifiques à chaque fournisseur
 */
interface ProviderDetectionConfig {
  name: 'google' | 'bing' | 'yandex' | 'apple';
  urlPattern: string;
}

/**
 * Classe pour la détection de Street View par présence de tuiles
 */
export class StreetViewDetectionCanvas {
  // Configuration de détection pour chaque fournisseur
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
   * Détecte les tuiles de Street View disponibles à un emplacement donné
   * Version nettoyée sans debug visuel
   */
  static async detectStreetViewAt(
    map: L.Map, 
    latlng: L.LatLng, 
    activeProviders: string[]
  ): Promise<StreetViewDetectionResult[]> {
    const results: StreetViewDetectionResult[] = [];
    
    // Ne traiter que les fournisseurs actifs
    const activeConfigs = this.providerConfigs.filter(
      config => activeProviders.includes(config.name)
    );
    
    // Pour chaque fournisseur actif
    for (const config of activeConfigs) {
      try {
        // Initialiser le résultat pour ce fournisseur
        const result: StreetViewDetectionResult = {
          provider: config.name,
          available: false
        };
        
        // Logique spécialisée pour Apple MVT Layer
        if (config.name === 'apple') {
          // Pour Apple, comme c'est activé dans le panel, on considère qu'il est disponible
          // (logique simplifiée car le layer Apple MVT a une architecture différente)
          result.available = true;
          result.closestPoint = latlng;
          result.distance = 0;
          result.tileUrl = 'Apple MVT Layer Active';
        } else {
          // Logique standard pour les autres fournisseurs
          const tileInfo = this.findTileForProvider(map, latlng, config);
          
          if (tileInfo) {
            // Si une tuile est trouvée, considérer que le panorama est disponible
            result.available = true;
            result.closestPoint = latlng; // Utiliser la position du clic comme position du panorama
            result.distance = 0;
            result.tileUrl = tileInfo.imgElement.src;
          }
        }
        
        results.push(result);
      } catch (error) {
        console.error(`Erreur lors de la détection pour ${config.name}:`, error);
        results.push({
          provider: config.name,
          available: false
        });
      }
    }
    
    return results;
  }

  /**
   * Trouve la tuile et l'élément image pour un fournisseur spécifique
   * à l'emplacement du clic - VERSION NETTOYÉE
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
  
    // Parcourir toutes les couches de la carte
    map.eachLayer((layer: L.Layer) => {
      // Vérifier si c'est une couche de tuiles correspondant au fournisseur
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
        
        // Utiliser les méthodes Leaflet pour convertir directement
        const point = map.project(latlng, zoom);
        const tileCoords = {
          x: Math.floor(point.x / 256),
          y: Math.floor(point.y / 256),
          z: zoom
        };
        
        // Chercher la tuile dans le cache de la couche
        for (const key in tileLayer._tiles) {
          const tile = tileLayer._tiles[key];
          
          // Si on trouve une tuile qui correspond à nos coordonnées
          if (
            tile.coords.x === tileCoords.x && 
            tile.coords.y === tileCoords.y && 
            tile.coords.z === tileCoords.z && 
            tile.el && 
            tile.el.complete
          ) {
            // Calculer la position du clic à l'intérieur de la tuile (en pixels)
            const clickPositionOnTile = {
              x: Math.floor(point.x % 256),
              y: Math.floor(point.y % 256)
            };
            
            result = {
              imgElement: tile.el,
              tileCoords,
              clickPositionOnTile
            };
            
            // SUPPRESSION DE TOUT L'AFFICHAGE VISUEL DE DEBUG
            // Plus de debugDiv, plus d'éléments visuels créés dans le DOM
            
            return result;
          }
        }
      }
      return null;
    });
  
    return result;
  }

  /**
   * Convertit des coordonnées géographiques en coordonnées de pixel sur la carte
   */
  private static latLngToTilePoint(latlng: L.LatLng, zoom: number): L.Point {
    const projectedPoint = L.CRS.EPSG3857.latLngToPoint(latlng, zoom);
    return projectedPoint.multiplyBy(Math.pow(2, zoom) * 256 / 256);
  }

  /**
   * Vérifie si le layer Apple MVT est présent et actif sur la carte
   * (Méthode pour usage futur - pour l'instant non utilisée)
   */
  private static checkAppleMVTLayer(map: L.Map): boolean {
    let hasAppleMVTLayer = false;
    
    map.eachLayer((layer: L.Layer) => {
      // Vérifier si c'est le layer Apple MVT (AppleMVTLayer)
      // On peut identifier le layer par son attribution ou ses propriétés
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
   * Crée une clé d'identification pour une tuile
   */
  private static getTileId(coords: { x: number; y: number; z: number }): string {
    return `${coords.x}:${coords.y}:${coords.z}`;
  }
}