import L from 'leaflet';
import proj4 from 'proj4';

// Définir les projections
proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs');
proj4.defs('EPSG:3395', '+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs');

/**
 * TileLayer personnalisé pour les tuiles Yandex qui utilisent EPSG:3395
 */
export class YandexTileLayer extends L.TileLayer {
  private urlTemplate: string;

  constructor(urlTemplate: string, options?: L.TileLayerOptions) {
    super(urlTemplate, options);
    this.urlTemplate = urlTemplate;
  }

  getTileUrl(coords: L.Coords): string {
    const z = coords.z;
    let x = coords.x;
    let y = coords.y;
    
    // Pour les zooms faibles, une conversion simple est suffisante
    if (z < 5) {
      return L.Util.template(this.urlTemplate, { x, y, z });
    }
    
    try {
      // 1. Convertir les coordonnées de tuile en coordonnées au coin supérieur gauche
      const n = Math.pow(2, z);
      const lng = (x / n) * 360 - 180;
      const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180 / Math.PI;
      
      // 2. Convertir les coordonnées géographiques en mètres (EPSG:3857)
      const point3857 = proj4('EPSG:3857', [lng, lat]);
      
      // 3. Convertir de EPSG:3857 à EPSG:3395
      const point3395 = proj4('EPSG:3857', 'EPSG:3395', point3857);
      
      // 4. Calculer les coordonnées de tuile pour EPSG:3395
      // Le facteur 156543.03392 est l'échelle en mètres/pixel au zoom 0 pour EPSG:3857
      // Pour EPSG:3395, cette valeur diffère légèrement
      const earthRadius3395 = 6378137.0; // Rayon de la Terre en mètres pour EPSG:3395
      const earthCircumference3395 = 2 * Math.PI * earthRadius3395;
      const metersPerPixel3395 = earthCircumference3395 / (256 * Math.pow(2, z));
      
      // Calculer la position de la tuile en EPSG:3395
      const tileSize = 256; // taille d'une tuile en pixels
      const xPixel3395 = (point3395[0] + earthCircumference3395/2) / metersPerPixel3395;
      const yPixel3395 = (earthCircumference3395/2 - point3395[1]) / metersPerPixel3395;
      
      // Convertir en indices de tuile
      x = Math.floor(xPixel3395 / tileSize);
      y = Math.floor(yPixel3395 / tileSize);
      
      // 5. Appliquer une correction fine empirique si nécessaire
      // Si après tests, vous constatez un léger décalage persistant
      const correctionFactorX = 1.0; // À ajuster si nécessaire
      const correctionFactorY = 1.0; // À ajuster si nécessaire
      x = Math.floor(x * correctionFactorX);
      y = Math.floor(y * correctionFactorY);
    } catch (error) {
      console.error("Erreur de conversion de projection pour Yandex:", error);
      // En cas d'erreur, utiliser les coordonnées originales
    }
    
    // Renvoyer l'URL avec les coordonnées calculées
    return L.Util.template(this.urlTemplate, { x, y, z });
  }
}

/**
 * Fonction d'aide pour créer une instance YandexTileLayer
 */
export function createYandexTileLayer(urlTemplate: string, options?: L.TileLayerOptions): YandexTileLayer {
  return new YandexTileLayer(urlTemplate, options);
}