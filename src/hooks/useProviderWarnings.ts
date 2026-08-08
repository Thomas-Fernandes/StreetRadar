/**
 * useProviderWarnings.ts
 *
 * Tracks the one-time notice shown when a provider whose support is not fully
 * reliable is enabled for the first time.
 *
 * This replaces four booleans in mapContainer — showYandexWarning,
 * yandexWarningShown, showAppleWarning, appleWarningShown — which cost two more
 * for every provider added and had to be kept in step by hand. A set of
 * already-seen providers plus the one currently on screen says the same thing
 * and does not grow.
 */

'use client';

import { useCallback, useState } from 'react';

/** Providers that carry a caveat worth showing once. */
export const PROVIDER_WARNINGS = {
    yandexPanoramas: {
        title: 'Yandex Panoramas — Alpha Feature',
        body: 'Yandex Panoramas support is currently in alpha testing. Coverage detection and panorama links may not work as expected.',
    },
    appleLookAround: {
        title: 'Apple Look Around — Beta Feature',
        body: 'Apple Look Around support is currently in beta. Known issues:',
        caveats: [
            'Maximum zoom level: 16',
            'Map matching contains errors for Canada, Spain, and Italy',
        ],
    },
} as const;

export type WarnedProvider = keyof typeof PROVIDER_WARNINGS;

export function isWarnedProvider(layer: string): layer is WarnedProvider {
    return layer in PROVIDER_WARNINGS;
}

export function useProviderWarnings() {
    /** The notice on screen right now, if any. */
    const [active, setActive] = useState<WarnedProvider | null>(null);

    /** Providers already warned about. Shown once per session, as before. */
    const [seen, setSeen] = useState<ReadonlySet<WarnedProvider>>(() => new Set());

    /**
     * Show the notice for a provider unless it has already been shown.
     * Safe to call for any layer — non-warned ones are ignored.
     */
    const warnOnce = useCallback(
        (layer: string) => {
            if (!isWarnedProvider(layer) || seen.has(layer)) return;
            setActive(layer);
            setSeen((previous) => new Set(previous).add(layer));
        },
        [seen]
    );

    const dismiss = useCallback(() => setActive(null), []);

    return { active, warnOnce, dismiss };
}
