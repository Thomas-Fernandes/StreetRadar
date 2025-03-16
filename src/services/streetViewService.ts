// src/services/streetViewService.ts

/**
 * Service pour gérer l'affichage des couches de Street View
 */
export class StreetViewService {
  /**
   * Génère une URL pour les tuiles de Street View
   * @returns URL template de la tuile
   */
  static getGoogleStreetViewTileUrl(): string {
    // URL pour les lignes de couverture Google Street View
    return 'https://maps.googleapis.com/maps/vt?pb=!1m7!8m6!1m3!1i{z}!2i{x}!3i{y}!2i9!3x1!2m8!1e2!2ssvv!4m2!1scc!2s*211m3*211e2*212b1*213e2*212b1*214b1!4m2!1ssvl!2s*211b0*212b1!3m8!2sen!3sus!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m4!1e0!8m2!1e1!1e1!6m6!1e12!2i2!11e0!39b0!44e0!50e0';
  }

  /**
   * Génère une URL pour les lignes de couverture Street View d'Apple Look Around
   * @returns URL template de la tuile
   */
  static getAppleLookAroundTileUrl(): string {
    // Apple n'offre pas d'équivalent public pour le moment
    // Cette méthode est un placeholder pour une implémentation future
    return '';
  }

  /**
   * Génère une URL pour les lignes de couverture Bing Streetside
   * @returns URL template de la tuile
   */
  static getBingStreetsideTileUrl(): string {
    // Bing n'offre pas d'équivalent public facilement accessible
    // Cette méthode est un placeholder pour une implémentation future
    return '';
  }

  /**
   * Génère une URL pour les lignes de couverture Mapillary
   * @returns URL template de la tuile
   */
  static getMapillaryTileUrl(): string {
    // On pourrait utiliser l'API Mapillary pour obtenir les lignes de couverture
    // https://www.mapillary.com/developer/api-documentation/
    return '';
  }
}