/**
 * AppleMVTLayer.ts
 * 
 * Layer Leaflet personnalisé pour gérer l'affichage des tuiles vectorielles MVT d'Apple Look Around.
 * 
 * Ce layer étend GridLayer de Leaflet pour créer des tuiles personnalisées qui récupèrent
 * et affichent les données vectorielles au format MVT depuis le CDN PMtiles.
 * Il gère les réponses 200 (données), 204 (tuile vide) et 404 (hors limites).
 */

import L from 'leaflet';
import { ApplePMTilesService, TileJSONMetadata } from './applePMTilesService';
import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';

/**
 * Options pour le layer MVT Apple
 */
export interface AppleMVTLayerOptions extends L.GridLayerOptions {
  style?: {
    color?: string;
    weight?: number;
    opacity?: number;
  };
}

/**
 * Layer personnalisé pour afficher les tuiles vectorielles MVT d'Apple
 */
export class AppleMVTLayer extends L.GridLayer {
  private tileJSONMetadata: TileJSONMetadata | null = null;
  private styleOptions: {
    color: string;
    weight: number;
    opacity: number;
  };

  constructor(options: AppleMVTLayerOptions = {}) {
    // Configuration par défaut du layer
    const defaultOptions: L.GridLayerOptions = {
      maxZoom: 16,
      minZoom: 3,
      tileSize: 256,
      ...options
    };

    super(defaultOptions);

    // Style par défaut pour les LineStrings Apple
    this.styleOptions = {
      color: '#007AFF', // Bleu Apple caractéristique
      weight: 2,
      opacity: 0.8,
      ...options.style
    };

    // Nettoyer le cache pour utiliser les URLs finales (tiles.streetradar.app)
    ApplePMTilesService.clearCache();
    
    // Initialiser les métadonnées TileJSON
    this.initializeTileJSON();
  }

  /**
   * Initialise les métadonnées TileJSON de manière asynchrone
   */
  private async initializeTileJSON(): Promise<void> {
    // Temporairement, on utilise directement des valeurs par défaut
    // car l'endpoint TileJSON n'est pas encore disponible
    console.log('Using default Apple PMtiles configuration (TileJSON endpoint not available)');
    
    this.tileJSONMetadata = {
      tilejson: "2.2.0",
      tiles: [ApplePMTilesService.getMVTUrlTemplate()],
      minzoom: 3,
      maxzoom: 16,
      attribution: "© Apple Look Around"
    };
    
    // Mettre à jour les options avec les limites par défaut
    (this.options as any).minZoom = 3;
    (this.options as any).maxZoom = 16;
    
    if (this._map) {
      this.redraw();
    }
  }

  /**
   * Crée une tuile personnalisée pour afficher les données MVT
   * Cette méthode est appelée par Leaflet pour chaque tuile visible
   */
  createTile(coords: L.Coords, done: L.DoneCallback): HTMLElement {
    // Créer un élément canvas pour dessiner les LineStrings
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Définir la taille du canvas selon tileSize
    const tileSize = this.getTileSize();
    canvas.width = tileSize.x;
    canvas.height = tileSize.y;

    // Récupérer et afficher les données MVT de manière asynchrone
    this.loadAndRenderMVTData(canvas, ctx, coords, done);

    return canvas;
  }

  /**
   * Charge et affiche les données MVT pour une tuile donnée
   */
  private async loadAndRenderMVTData(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    coords: L.Coords,
    done: L.DoneCallback
  ): Promise<void> {
    try {
      // Vérifier si le zoom est dans les limites avant de faire l'appel
      if (this.tileJSONMetadata) {
        if (coords.z < this.tileJSONMetadata.minzoom || coords.z > this.tileJSONMetadata.maxzoom) {
          // Hors limites : ne pas faire d'appel
          done(undefined, canvas);
          return;
        }
      }

      // Construire l'URL de la tuile MVT
      const url = ApplePMTilesService.getMVTTileUrl(coords.x, coords.y, coords.z);
      
      // Récupérer la tuile MVT
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/x-protobuf'
        }
      });

      if (response.status === 204) {
        // Tuile vide : ne rien dessiner
        done(undefined, canvas);
        return;
      }

      if (response.status === 404) {
        // Hors limites : ne rien dessiner
        done(undefined, canvas);
        return;
      }

      if (!response.ok) {
        throw new Error(`MVT request failed: ${response.status} ${response.statusText}`);
      }

      // Récupérer les données binaires MVT
      const arrayBuffer = await response.arrayBuffer();
      
      // Parser et afficher les données MVT
      await this.renderMVTData(ctx, arrayBuffer, coords);
      
      done(undefined, canvas);
    } catch (error) {
      console.error(`Failed to load MVT tile ${coords.z}/${coords.x}/${coords.y}:`, error);
      done(error as Error, canvas);
    }
  }

  /**
   * Parse et affiche les données MVT sur le canvas
   * 
   * Cette méthode parse les vraies données vectorielles MVT et affiche les LineStrings.
   */
  private async renderMVTData(
    ctx: CanvasRenderingContext2D,
    arrayBuffer: ArrayBuffer,
    coords: L.Coords
  ): Promise<void> {
    try {
      // Configuration du style de dessin
      ctx.strokeStyle = this.styleOptions.color;
      ctx.lineWidth = this.styleOptions.weight;
      ctx.globalAlpha = this.styleOptions.opacity;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Parser les données MVT
      const tile = new VectorTile(new Protobuf(arrayBuffer));
      
      let featuresRendered = 0;
      
      // Parcourir tous les layers dans la tuile MVT
      for (const layerName in tile.layers) {
        const layer = tile.layers[layerName];
        
        // Parcourir toutes les features dans le layer
        for (let i = 0; i < layer.length; i++) {
          const feature = layer.feature(i);
          
          // Ne traiter que les LineStrings (type 2)
          if (feature.type === 2) {
            const geometry = feature.loadGeometry();
            
            // Dessiner chaque ring de la géométrie
            for (const ring of geometry) {
              if (ring.length < 2) continue; // Ignorer les rings avec moins de 2 points
              
              ctx.beginPath();
              
              // Dessiner la ligne
              for (let j = 0; j < ring.length; j++) {
                const point = ring[j];
                
                // Convertir les coordonnées de la tuile (0-4096) vers pixels canvas (0-256)
                const x = (point.x / 4096) * 256;
                const y = (point.y / 4096) * 256;
                
                if (j === 0) {
                  ctx.moveTo(x, y);
                } else {
                  ctx.lineTo(x, y);
                }
              }
              
              ctx.stroke();
              featuresRendered++;
            }
          }
        }
      }
      
      // Log pour debug (optionnel, peut être retiré en production)
      if (featuresRendered > 0) {
        console.log(`Rendered ${featuresRendered} Apple Look Around features in tile ${coords.z}/${coords.x}/${coords.y}`);
      }

    } catch (error) {
      console.error('Failed to render MVT data:', error);
      
      // En cas d'erreur, afficher un indicateur d'erreur
      ctx.fillStyle = '#ff0000';
      ctx.font = '10px Arial';
      ctx.fillText(`Error: ${coords.z}/${coords.x}/${coords.y}`, 5, 15);
    }
  }

  /**
   * Met à jour le style du layer
   */
  setStyle(style: Partial<AppleMVTLayerOptions['style']>): this {
    this.styleOptions = {
      ...this.styleOptions,
      ...style
    };
    
    // Redraw le layer si il est sur une carte
    if (this._map) {
      this.redraw();
    }
    
    return this;
  }

  /**
   * Récupère les métadonnées TileJSON
   */
  getTileJSONMetadata(): TileJSONMetadata | null {
    return this.tileJSONMetadata;
  }
}

/**
 * Factory function pour créer une instance d'AppleMVTLayer
 * Compatible avec le pattern Leaflet
 */
export function createAppleMVTLayer(options?: AppleMVTLayerOptions): AppleMVTLayer {
  return new AppleMVTLayer(options);
} 