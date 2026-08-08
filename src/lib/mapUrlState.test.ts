import { describe, expect, it } from 'vitest';
import { type MapUrlState, enabledLayerKeys, formatMapHash, parseMapHash } from './mapUrlState';

describe('parseMapHash', () => {
    it('reads a full hash', () => {
        expect(parseMapHash('#12/48.85341/2.34878/apple,google/satellite')).toEqual({
            zoom: 12,
            lat: 48.85341,
            lon: 2.34878,
            layers: ['appleLookAround', 'googleStreetView'],
            basemap: 'satellite',
        });
    });

    it('works without the leading hash', () => {
        expect(parseMapHash('5/0/0/ja/osm')?.zoom).toBe(5);
    });

    it.each(['', '#', '   ', '#not/a/hash', '#12//2', '#/48/2'])(
        'returns null for unusable input: %j',
        (hash) => {
            expect(parseMapHash(hash)).toBeNull();
        }
    );

    it('distinguishes an absent layer section from an empty one', () => {
        // No section at all: the caller keeps its defaults.
        expect(parseMapHash('#12/48/2')?.layers).toBeNull();
        // Section present but empty: the link deliberately turned everything off.
        expect(parseMapHash('#12/48/2//osm')?.layers).toEqual([]);
    });

    it('drops unknown layer slugs rather than failing', () => {
        expect(parseMapHash('#12/48/2/apple,notaprovider,ja')?.layers).toEqual([
            'appleLookAround',
            'jaStreetView',
        ]);
    });

    it('falls back to osm for an unknown basemap', () => {
        expect(parseMapHash('#12/48/2/apple/hologram')?.basemap).toBe('osm');
    });

    it('clamps zoom to what the map supports', () => {
        expect(parseMapHash('#99/48/2')?.zoom).toBe(19);
        expect(parseMapHash('#-5/48/2')?.zoom).toBe(1);
    });

    it('clamps latitude to the Web Mercator limit', () => {
        // Beyond ~85 degrees the projection has no meaning and Leaflet clamps too.
        expect(parseMapHash('#3/89/2')?.lat).toBeCloseTo(85.05112878, 5);
        expect(parseMapHash('#3/-89/2')?.lat).toBeCloseTo(-85.05112878, 5);
    });

    it('wraps longitude so a map panned round the world still links canonically', () => {
        expect(parseMapHash('#3/48/190')?.lon).toBeCloseTo(-170, 5);
        expect(parseMapHash('#3/48/-190')?.lon).toBeCloseTo(170, 5);
        // 540 is 180 plus a full turn. It comes back as -180, which is the same
        // meridian — the antimeridian has two spellings and this is the canonical one.
        expect(parseMapHash('#3/48/540')?.lon).toBeCloseTo(-180, 5);
    });
});

describe('formatMapHash', () => {
    const base: MapUrlState = {
        zoom: 12,
        lat: 48.853409,
        lon: 2.348783,
        layers: ['googleStreetView', 'appleLookAround'],
        basemap: 'osm',
    };

    it('emits zoom/lat/lon/layers/basemap', () => {
        expect(formatMapHash(base)).toBe('#12/48.85341/2.34878/google,apple/osm');
    });

    it('orders slugs consistently regardless of the input order', () => {
        const reversed = { ...base, layers: ['appleLookAround', 'googleStreetView'] as const };
        expect(formatMapHash({ ...reversed, layers: [...reversed.layers] })).toBe(
            formatMapHash(base)
        );
    });

    it('emits an empty section when no layer is on', () => {
        expect(formatMapHash({ ...base, layers: [] })).toBe('#12/48.85341/2.34878//osm');
    });

    it('treats null layers as none', () => {
        expect(formatMapHash({ ...base, layers: null })).toBe('#12/48.85341/2.34878//osm');
    });
});

describe('round trip', () => {
    it.each([
        [12, 48.85341, 2.34878],
        [1, 0, 0],
        [19, -33.86882, 151.20929],
        [8, 64.13548, -21.89541],
    ])('survives parse(format(...)) at %i/%f/%f', (zoom, lat, lon) => {
        const state: MapUrlState = {
            zoom,
            lat,
            lon,
            layers: ['naverStreetView'],
            basemap: 'carto',
        };
        expect(parseMapHash(formatMapHash(state))).toEqual(state);
    });
});

describe('enabledLayerKeys', () => {
    it('returns only the layers that are on', () => {
        expect(
            enabledLayerKeys({
                googleStreetView: true,
                bingStreetside: false,
                appleLookAround: true,
            })
        ).toEqual(['googleStreetView', 'appleLookAround']);
    });

    it('ignores keys that are not layers', () => {
        expect(enabledLayerKeys({ somethingElse: true })).toEqual([]);
    });
});
