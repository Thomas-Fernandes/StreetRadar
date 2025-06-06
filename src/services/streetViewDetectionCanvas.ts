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
      urlPattern: 'apple.com'
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
    
    console.log("Fournisseurs actifs à vérifier:", activeProviders);
    
    // Pour chaque fournisseur actif
    for (const config of activeConfigs) {
      try {
        // Initialiser le résultat pour ce fournisseur
        const result: StreetViewDetectionResult = {
          provider: config.name,
          available: false
        };
        
        // Trouver la tuile correspondante dans les couches de la carte
        const tileInfo = this.findTileForProvider(map, latlng, config);
        
        if (tileInfo) {
          console.log(`✅ Tuile trouvée pour ${config.name}:`, tileInfo.imgElement.src);
          
          // Si une tuile est trouvée, considérer que le panorama est disponible
          result.available = true;
          result.closestPoint = latlng; // Utiliser la position du clic comme position du panorama
          result.distance = 0;
          result.tileUrl = tileInfo.imgElement.src;
        } else {
          console.log(`❌ Aucune tuile trouvée pour ${config.name}`);
        }
        
        results.push(result);
      } catch (error) {
        console.error(`❌ Erreur lors de la détection pour ${config.name}:`, error);
        results.push({
          provider: config.name,
          available: false
        });
      }
    }
    
    console.log("📊 Résultats finaux de détection:", results);
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
    map.eachLayer((layer: any) => {
      // Vérifier si c'est une couche de tuiles correspondant au fournisseur
      if (
        layer._url && 
        layer._url.includes(config.urlPattern) && 
        layer._tiles && 
        !result
      ) {
        console.log(`🔍 Couche trouvée pour ${config.name}:`, layer._url);
        const zoom = map.getZoom();
        
        // Utiliser les méthodes Leaflet pour convertir directement
        const point = map.project(latlng, zoom);
        const tileCoords = {
          x: Math.floor(point.x / 256),
          y: Math.floor(point.y / 256),
          z: zoom
        };
        
        console.log(`📍 Coordonnées de tuile pour ${config.name}:`, tileCoords);
        
        // Chercher la tuile dans le cache de la couche
        for (const key in layer._tiles) {
          const tile = layer._tiles[key];
          
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
            
            // Log uniquement dans la console pour le debug
            console.log(`🎯 Tuile trouvée pour ${config.name} à ${tileCoords.x},${tileCoords.y},${tileCoords.z}`);
            console.log(`📌 Position du clic dans la tuile: ${clickPositionOnTile.x},${clickPositionOnTile.y}`);
            
            // SUPPRESSION DE TOUT L'AFFICHAGE VISUEL DE DEBUG
            // Plus de debugDiv, plus d'éléments visuels créés dans le DOM
            
            return;
          }
        }
        
        console.log(`⚠️ Aucune tuile trouvée pour ${config.name} aux coordonnées`, tileCoords);
      }
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
   * Crée une clé d'identification pour une tuile
   */
  private static getTileId(coords: { x: number; y: number; z: number }): string {
    return `${coords.x}:${coords.y}:${coords.z}`;
  }
}