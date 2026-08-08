/**
 * usePanoramaDetection.ts
 *
 * Everything that happens between a click on the map and a panorama bubble:
 * the transient "clicked here" marker, the detection request, its results, and
 * the screen position the bubble is pinned to while the map moves.
 *
 * Five pieces of state and three effects, all of which lived in mapContainer
 * next to layer toggles and panel visibility. None of them are related to those.
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type L from 'leaflet';
import { PanoramaService } from '@/services/panoramaService';
import type { StreetViewDetectionResult } from '@/services/streetViewDetectionCanvas';

/** How long the transient click marker stays before fading out. */
const CLICK_MARKER_TIMEOUT_MS = 5000;

/** Leaflet events after which the bubble has to be re-anchored. */
const MAP_MOVE_EVENTS = ['move', 'zoom', 'zoomstart', 'zoomend', 'movestart', 'moveend'] as const;

export interface ClickInfo {
    position: L.LatLng | null;
    type: 'click' | 'drop';
    timestamp: number;
}

/**
 * Turns the layer state keys into the provider ids PanoramaService expects:
 * googleStreetView -> google, appleLookAround -> apple, jaStreetView -> ja.
 */
export function activeProviderIds(visibleLayers: Record<string, boolean>): string[] {
    return Object.entries(visibleLayers)
        .filter(([, isVisible]) => isVisible)
        .map(([layer]) => {
            if (layer === 'jaStreetView') return 'ja';
            return layer
                .replace('StreetView', '')
                .replace('Streetside', '')
                .replace('Panoramas', '')
                .replace('LookAround', '')
                .toLowerCase();
        });
}

interface Options {
    map: L.Map | null;
    visibleLayers: Record<string, boolean>;
}

export function usePanoramaDetection({ map, visibleLayers }: Options) {
    const [clickInfo, setClickInfo] = useState<ClickInfo | null>(null);
    const [detectionResults, setDetectionResults] = useState<StreetViewDetectionResult[]>([]);
    const [detectedPosition, setDetectedPosition] = useState<L.LatLng | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);
    // Bumped on every map move so the derived pixel position recomputes.
    const [moveTick, setMoveTick] = useState(0);

    // Keep the transient marker pinned to its geographic point while the map
    // moves under it.
    //
    // The effect only subscribes and bumps a counter; the pixel position is
    // derived during render. Projecting inside the effect and calling setState
    // there would run a second render pass before every paint, which is what
    // react-hooks/set-state-in-effect is about — and re-projecting is cheap
    // enough that deriving it is simply the better shape.
    useEffect(() => {
        if (!map || !clickInfo?.position) return;

        const onMapMoved = () => setMoveTick((tick) => tick + 1);
        MAP_MOVE_EVENTS.forEach((event) => map.on(event, onMapMoved));

        return () => {
            MAP_MOVE_EVENTS.forEach((event) => map.off(event, onMapMoved));
        };
    }, [map, clickInfo?.position]);

    const markerScreenPos = useMemo(() => {
        const position = clickInfo?.position;
        if (!map || !position) return null;

        try {
            const point = map.latLngToContainerPoint(position);
            return { x: point.x, y: point.y };
        } catch (error) {
            console.error('Error during coordinate conversion:', error);
            return null;
        }
        // moveTick is the dependency that matters: it is what changes when the
        // map pans or zooms under a fixed geographic point.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, clickInfo?.position, moveTick]);

    // The marker is transient: it disappears on its own if detection has not
    // replaced it by then.
    useEffect(() => {
        if (!clickInfo) return;
        const timer = setTimeout(() => setClickInfo(null), CLICK_MARKER_TIMEOUT_MS);
        return () => clearTimeout(timer);
    }, [clickInfo]);

    const close = useCallback(() => {
        setDetectedPosition(null);
        setDetectionResults([]);
    }, []);

    const detect = useCallback(
        async (latlng: L.LatLng, type: 'click' | 'drop') => {
            if (!map) return;

            setClickInfo({ position: latlng, type, timestamp: Date.now() });
            setIsDetecting(true);

            try {
                const results = await PanoramaService.detectPanoramasAt(
                    map,
                    latlng,
                    activeProviderIds(visibleLayers),
                    { method: 'canvas' }
                );

                setDetectionResults(results);

                // Anchor the bubble to the nearest actual panorama when there is
                // one, so it does not float over empty road.
                const found = results.find(
                    (result: StreetViewDetectionResult) => result.available && result.closestPoint
                );
                setDetectedPosition(found?.closestPoint ?? latlng);
            } catch (error) {
                console.error('Error during panorama detection:', error);
                setDetectedPosition(latlng);
                setDetectionResults([]);
            } finally {
                setClickInfo(null);
                setIsDetecting(false);
            }
        },
        [map, visibleLayers]
    );

    /** A click on an open bubble closes it rather than starting a new search. */
    const handleMapClick = useCallback(
        async (latlng: L.LatLng) => {
            if (detectedPosition) {
                close();
                return;
            }
            await detect(latlng, 'click');
        },
        [detectedPosition, close, detect]
    );

    const handlePegcatDrop = useCallback(
        async (latlng: L.LatLng) => detect(latlng, 'drop'),
        [detect]
    );

    return {
        clickInfo,
        detectionResults,
        detectedPosition,
        isDetecting,
        markerScreenPos,
        handleMapClick,
        handlePegcatDrop,
        close,
    };
}
