/**
 * StreetViewService.ts
 * 
 * Service dédié à la gestion des URLs des tuiles pour les différentes couches de couverture Street View.
 * 
 * Ce service centralise la logique de génération des URLs pour les différents fournisseurs
 * de Street View (Google, Apple, Bing, etc.). Il fournit des méthodes statiques
 * qui retournent les modèles d'URL appropriés pour chaque fournisseur, que les composants
 * de carte peuvent ensuite utiliser pour afficher les couches de couverture.
 * 
 * Les URLs générées sont formatées pour être compatibles avec Leaflet qui remplacera
 * les variables {x}, {y}, et {z} par les coordonnées et le niveau de zoom appropriés.
 */

export class StreetViewService {
  /**
   * Génère l'URL pour les tuiles de couverture Google Street View
   * 
   * Cette URL permet d'afficher les lignes bleues indiquant où Street View est disponible
   * sur la carte. Le format est compatible avec Leaflet qui remplacera {x}, {y}, {z}
   * par les coordonnées et niveau de zoom appropriés.
   * 
   * @returns URL template pour les tuiles de couverture Google Street View
   */
  static getGoogleStreetViewTileUrl(): string {
    // Cette URL provient d'une analyse du fonctionnement de Google Maps
    // Les paramètres incluent des configurations pour afficher spécifiquement les lignes de Street View
    return 'https://maps.googleapis.com/maps/vt?pb=!1m7!8m6!1m3!1i{z}!2i{x}!3i{y}!2i9!3x1!2m8!1e2!2ssvv!4m2!1scc!2s*211m3*211e2*212b1*213e2*212b1*214b1!4m2!1ssvl!2s*211b0*212b1!3m8!2sen!3sus!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m4!1e0!8m2!1e1!1e1!6m6!1e12!2i2!11e0!39b0!44e0!50e0';
  }

  /**
   * Génère l'URL pour les tuiles de couverture Apple Look Around
   * 
   * Note: Actuellement, Apple ne fournit pas d'API publique pour leurs données de couverture.
   * Cette méthode est un placeholder pour une implémentation future si de telles données
   * deviennent disponibles.
   * 
   * @returns URL template pour les tuiles Apple Look Around (actuellement vide)
   */
  static getAppleLookAroundTileUrl(): string {
    // Apple n'offre pas d'équivalent public pour le moment
    // Cette méthode est un placeholder pour une implémentation future
    return '';
  }

  /**
   * Génère l'URL pour les tuiles de couverture Bing Streetside
   * 
   * Note: Actuellement un placeholder car Bing n'expose pas facilement 
   * ces données via une API publique.
   * 
   * @returns URL template pour les tuiles Bing Streetside (actuellement vide)
   */
  static getBingStreetsideTileUrl(): string {
    // Bing n'offre pas d'équivalent public facilement accessible
    // Cette méthode est un placeholder pour une implémentation future
    return '';
  }

}