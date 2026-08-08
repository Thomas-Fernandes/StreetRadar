/**
 * useMapUrlState.ts
 *
 * Keeps the URL hash in step with what the map is showing.
 *
 * Writes use replaceState rather than pushState: panning a map generates a
 * continuous stream of view changes, and pushing each one would make the back
 * button walk through hundreds of intermediate positions instead of leaving
 * the page.
 */

'use client';

import { useEffect, useRef } from 'react';
import type L from 'leaflet';
import {
    type Basemap,
    type MapUrlState,
    enabledLayerKeys,
    formatMapHash,
    parseMapHash,
} from '@/lib/mapUrlState';

/**
 * Reads the view out of the current URL.
 *
 * Safe during SSR: returns null when there is no window, so the caller falls
 * back to its default view.
 */
export function readMapHash(): MapUrlState | null {
    if (typeof window === 'undefined') return null;
    return parseMapHash(window.location.hash);
}

interface Options {
    map: L.Map | null;
    visibleLayers: Record<string, boolean>;
    basemap: string;
}

export function useMapUrlState({ map, visibleLayers, basemap }: Options): void {
    // Holds the last hash we wrote, so the hashchange listener can tell our own
    // writes apart from a user editing the address bar or hitting back.
    const lastWritten = useRef<string>('');

    useEffect(() => {
        if (!map) return;

        const write = () => {
            const center = map.getCenter();
            const hash = formatMapHash({
                zoom: map.getZoom(),
                lat: center.lat,
                lon: center.lng,
                layers: enabledLayerKeys(visibleLayers),
                basemap: basemap as Basemap,
            });

            if (hash === lastWritten.current) return;
            lastWritten.current = hash;

            window.history.replaceState(null, '', `${window.location.pathname}${hash}`);
        };

        write();

        // moveend covers panning and zooming; layeradd/layerremove would fire
        // far too often, so layer changes come in through the effect deps.
        map.on('moveend', write);

        return () => {
            map.off('moveend', write);
        };
    }, [map, visibleLayers, basemap]);
}
