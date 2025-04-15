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
   * Cette URL permet d'afficher les lignes violettes indiquant où Streetside est disponible.
   * Elle utilise le système de quadkey de Bing Maps pour identifier les tuiles.
   * 
   * @returns URL template pour les tuiles Bing Streetside
   */
  static getBingStreetsideTileUrl(): string {
    // Cette URL a été identifiée par l'analyse du réseau et correspond au format utilisé par Bing Maps
    // La notation {q} sera remplacée par un TileLayer personnalisé qui convertira les coordonnées en quadkey
    return 'https://t.ssl.ak.dynamic.tiles.virtualearth.net/comp/ch/{q}?mkt=fr-FR&it=Z,HC&n=t&og=2651&sv=9.36';
  }

  /**
   * Convertit les coordonnées de tuile (x, y, z) en quadkey de Bing Maps
   * 
   * Le quadkey est un système de notation utilisé par Bing Maps où chaque tuile est identifiée
   * par une chaîne unique de chiffres 0-3, chacun représentant un quadrant à chaque niveau de zoom.
   * 
   * @param x - La coordonnée X de la tuile
   * @param y - La coordonnée Y de la tuile
   * @param z - Le niveau de zoom
   * @returns Le quadkey correspondant aux coordonnées
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
   * Génère l'URL pour les tuiles de couverture Yandex Panoramas
   * 
   * Cette URL permet d'afficher les lignes indiquant où Yandex Panoramas est disponible
   * sur la carte.
   * 
   * @returns URL template pour les tuiles de couverture Yandex Panoramas
   */
  static getYandexPanoramasTileUrl(): string {
    return 'https://04.core-stv-renderer.maps.yandex.net/2.x/tiles?l=stv,sta&x={x}&y={y}&z={z}&scale=1&v=2025.04.14.22.49-1_25.04.11-0-24374&lang=en_UA&format=png&client_id=yandex-web-maps';
  }
}