/**
 * mapUrlState.ts
 *
 * Encodes the map view in the URL hash so a position can be shared.
 *
 * Until now /map was a single URL for the entire planet: you could not link
 * anyone to a place, and every visit started at the same default view. That is
 * also why the site has three indexable URLs — there was nothing to index.
 *
 * Format:  #zoom/lat/lon/layers/basemap
 * Example: #12/48.85341/2.34878/apple,google/osm
 *
 * The hash rather than a query string, deliberately: it is what every mapping
 * site uses (OpenStreetMap, Google Maps, Mapy), so the shape is familiar, and
 * updating it never round-trips to the server.
 */

import { isProviderEnabled } from '@/lib/site';

/** URL slug -> the key used in the map's `visibleLayers` state. */
export const LAYER_SLUGS = {
    google: 'googleStreetView',
    bing: 'bingStreetside',
    yandex: 'yandexPanoramas',
    apple: 'appleLookAround',
    naver: 'naverStreetView',
    ja: 'jaStreetView',
} as const;

export type LayerSlug = keyof typeof LAYER_SLUGS;
export type LayerKey = (typeof LAYER_SLUGS)[LayerSlug];

/**
 * The reverse of LAYER_SLUGS. The map state is keyed by LayerKey but the kill
 * switch and the provider list are keyed by slug, so something has to translate
 * — and deriving it here keeps the two lists from drifting apart.
 */
export const LAYER_KEY_TO_SLUG = Object.fromEntries(
    (Object.keys(LAYER_SLUGS) as LayerSlug[]).map((slug) => [LAYER_SLUGS[slug], slug])
) as Record<LayerKey, LayerSlug>;

export const BASEMAPS = ['osm', 'carto', 'satellite', 'none'] as const;
export type Basemap = (typeof BASEMAPS)[number];

export interface MapUrlState {
    zoom: number;
    lat: number;
    lon: number;
    /**
     * null when the link carried no layer section at all, which means "keep the
     * defaults". An empty array is different: it means the link explicitly
     * turned every overlay off, and must be honoured.
     */
    layers: LayerKey[] | null;
    basemap: Basemap;
}

/** Web Mercator cannot represent the poles, and Leaflet clamps to this. */
const MAX_LATITUDE = 85.05112878;

/**
 * Five decimals is a little over one metre — far finer than any coverage line
 * is drawn, and short enough to keep shared links readable.
 */
const COORD_PRECISION = 5;

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Wraps longitude into [-180, 180] so a map panned several times round still
 * produces a canonical link.
 *
 * The early return is not an optimisation: the modulo arithmetic loses the last
 * digits of a float, so running it on a value already in range turned
 * -21.89541 into -21.89540999999997 and broke the parse/format round trip.
 */
function wrapLongitude(lon: number): number {
    if (lon >= -180 && lon <= 180) return lon;
    return ((((lon + 180) % 360) + 360) % 360) - 180;
}

/**
 * Parses a map hash. Returns null when it is absent or unusable, in which case
 * the caller keeps its defaults — a malformed link should land on the world
 * view, not an error.
 */
export function parseMapHash(hash: string): MapUrlState | null {
    const raw = hash.replace(/^#/, '').trim();
    if (!raw) return null;

    const [zoomPart, latPart, lonPart, layersPart, basemapPart] = raw.split('/');

    // Number('') is 0, not NaN, so an empty segment would silently read as a
    // valid coordinate: '#12//2' would land on the equator instead of being
    // rejected. Each part has to be present before it is converted.
    const numeric = (part: string | undefined): number =>
        part === undefined || part.trim() === '' ? Number.NaN : Number(part);

    const zoom = numeric(zoomPart);
    const lat = numeric(latPart);
    const lon = numeric(lonPart);

    if (!Number.isFinite(zoom) || !Number.isFinite(lat) || !Number.isFinite(lon)) {
        return null;
    }

    const layers =
        layersPart === undefined
            ? null
            : layersPart
                  .split(',')
                  .map((slug) => slug.trim().toLowerCase())
                  .filter((slug): slug is LayerSlug => slug in LAYER_SLUGS)
                  // A link written before a provider was switched off must not
                  // resurrect it.
                  .filter((slug) => isProviderEnabled(slug))
                  .map((slug) => LAYER_SLUGS[slug]);

    const basemap = BASEMAPS.includes(basemapPart as Basemap) ? (basemapPart as Basemap) : 'osm';

    return {
        zoom: clamp(Math.round(zoom), 1, 19),
        lat: clamp(lat, -MAX_LATITUDE, MAX_LATITUDE),
        lon: wrapLongitude(lon),
        layers,
        basemap,
    };
}

/** Builds the hash for a given view. Always starts with '#'. */
export function formatMapHash(state: MapUrlState): string {
    const active = state.layers ?? [];
    const slugs = (Object.keys(LAYER_SLUGS) as LayerSlug[]).filter((slug) =>
        active.includes(LAYER_SLUGS[slug])
    );

    return [
        `#${clamp(Math.round(state.zoom), 1, 19)}`,
        clamp(state.lat, -MAX_LATITUDE, MAX_LATITUDE).toFixed(COORD_PRECISION),
        wrapLongitude(state.lon).toFixed(COORD_PRECISION),
        slugs.join(','),
        state.basemap,
    ].join('/');
}

/** Turns the `visibleLayers` state object into the list of enabled keys. */
export function enabledLayerKeys(visible: Record<string, boolean>): LayerKey[] {
    return Object.values(LAYER_SLUGS).filter((key) => visible[key]);
}

/**
 * The provider ids to query for a click, given the layer state.
 *
 * Lives here rather than next to the detection hook because it is pure and that
 * hook imports Leaflet, which needs `window` and so cannot be loaded in a plain
 * node test — and this is exactly the function a kill-switch test has to cover.
 *
 * Derived from LAYER_KEY_TO_SLUG. It used to strip suffixes off the key by hand
 * ('googleStreetView' -> replace 'StreetView' -> 'google') with a special case
 * for jaStreetView, which quietly depended on no two providers sharing a
 * suffix — 'naverStreetView' only worked because it was tried after the others.
 */
export function activeProviderIds(visible: Record<string, boolean>): LayerSlug[] {
    return (Object.keys(LAYER_KEY_TO_SLUG) as LayerKey[])
        .filter((key) => visible[key])
        .map((key) => LAYER_KEY_TO_SLUG[key])
        .filter((slug) => isProviderEnabled(slug));
}
