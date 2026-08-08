/**
 * useMapUI.ts
 *
 * Open/closed state for the map's chrome: the layer panel, the basemap picker
 * and the statistics drawer.
 *
 * Three booleans and three near-identical togglers, all unrelated to what the
 * map is actually showing. Grouping them keeps mapContainer's state list about
 * the map rather than about its furniture.
 */

'use client';

import { useCallback, useState } from 'react';

export function useMapUI() {
    const [isPanelCollapsed, setPanelCollapsed] = useState(false);
    const [isBasemapSelectorOpen, setBasemapSelectorOpen] = useState(false);
    const [isStatisticsPanelOpen, setStatisticsPanelOpen] = useState(false);

    const togglePanel = useCallback(() => setPanelCollapsed((open) => !open), []);

    const toggleBasemapSelector = useCallback(() => setBasemapSelectorOpen((open) => !open), []);

    const toggleStatisticsPanel = useCallback(() => setStatisticsPanelOpen((open) => !open), []);

    /** Called after picking a basemap, which closes the picker. */
    const closeBasemapSelector = useCallback(() => setBasemapSelectorOpen(false), []);

    return {
        isPanelCollapsed,
        isBasemapSelectorOpen,
        isStatisticsPanelOpen,
        togglePanel,
        toggleBasemapSelector,
        toggleStatisticsPanel,
        closeBasemapSelector,
    };
}
