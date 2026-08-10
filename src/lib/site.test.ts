/**
 * site.test.ts
 *
 * Tests for the provider kill switch.
 *
 * This is the mechanism that lets a provider be taken off the site in about a
 * minute if it ever asks us to stop. A kill switch that silently fails to kill
 * is worse than not having one, so the cases below are deliberately about what
 * must *not* happen: no killed provider in the user-facing list, no killed
 * provider revived by an old shared link, no killed provider queried on click.
 *
 * DISABLED_PROVIDERS is read once at module load, so every case re-imports the
 * module with a different environment via vi.resetModules().
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadSite(disabled?: string) {
    vi.resetModules();
    if (disabled === undefined) {
        vi.stubEnv('NEXT_PUBLIC_DISABLED_PROVIDERS', '');
    } else {
        vi.stubEnv('NEXT_PUBLIC_DISABLED_PROVIDERS', disabled);
    }
    return import('./site');
}

async function loadUrlState(disabled?: string) {
    await loadSite(disabled);
    return import('./mapUrlState');
}

afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
});

describe('isProviderEnabled', () => {
    it('enables every provider when the variable is unset', async () => {
        const { PROVIDERS, ENABLED_PROVIDERS } = await loadSite();
        expect(ENABLED_PROVIDERS).toHaveLength(PROVIDERS.length);
    });

    it('disables a single named provider', async () => {
        const { isProviderEnabled, ENABLED_PROVIDERS } = await loadSite('ja');
        expect(isProviderEnabled('ja')).toBe(false);
        expect(isProviderEnabled('google')).toBe(true);
        expect(ENABLED_PROVIDERS.map((p) => p.id)).not.toContain('ja');
    });

    it('disables several, and tolerates whitespace and case', async () => {
        const { isProviderEnabled } = await loadSite(' JA , Naver ');
        expect(isProviderEnabled('ja')).toBe(false);
        expect(isProviderEnabled('naver')).toBe(false);
        expect(isProviderEnabled('apple')).toBe(true);
    });

    it('is case-insensitive on the queried id too', async () => {
        const { isProviderEnabled } = await loadSite('ja');
        expect(isProviderEnabled('JA')).toBe(false);
    });

    it('ignores empty entries rather than disabling everything', async () => {
        const { ENABLED_PROVIDERS, PROVIDERS } = await loadSite(',,  ,');
        expect(ENABLED_PROVIDERS).toHaveLength(PROVIDERS.length);
    });

    it('ignores an unknown id without disabling anything real', async () => {
        const { ENABLED_PROVIDERS, PROVIDERS } = await loadSite('mapy,notaprovider');
        expect(ENABLED_PROVIDERS).toHaveLength(PROVIDERS.length);
    });
});

describe('coverage dates follow the kill switch', () => {
    it('reports the oldest enabled date, not the oldest overall', async () => {
        const all = await loadSite();
        expect(all.oldestCoverageDate()).toBe('2025-02'); // Apple

        const withoutApple = await loadSite('apple');
        expect(withoutApple.oldestCoverageDate()).toBe('2025-09');
    });

    it('returns null when every collected provider is off', async () => {
        const { oldestCoverageDate, newestCoverageDate } = await loadSite('apple,naver,ja');
        expect(oldestCoverageDate()).toBeNull();
        expect(newestCoverageDate()).toBeNull();
    });

    it('still reports a date when only live providers are disabled', async () => {
        const { oldestCoverageDate } = await loadSite('google,bing,yandex');
        expect(oldestCoverageDate()).toBe('2025-02');
    });
});

describe('an old permalink cannot revive a killed provider', () => {
    it('drops the killed slug while keeping the others', async () => {
        const { parseMapHash } = await loadUrlState('ja');
        const state = parseMapHash('#12/64.14/-21.89/ja,apple/osm');
        expect(state?.layers).toEqual(['appleLookAround']);
    });

    it('yields an empty layer list when the link named only killed providers', async () => {
        const { parseMapHash } = await loadUrlState('ja');
        const state = parseMapHash('#12/64.14/-21.89/ja/osm');
        // Empty, not null: the link did carry a layer section, so the map must
        // honour it as "nothing on" rather than falling back to the defaults.
        expect(state?.layers).toEqual([]);
    });

    it('keeps the slug when nothing is killed', async () => {
        const { parseMapHash } = await loadUrlState();
        const state = parseMapHash('#12/64.14/-21.89/ja/osm');
        expect(state?.layers).toEqual(['jaStreetView']);
    });

    it('leaves position and basemap alone', async () => {
        const { parseMapHash } = await loadUrlState('ja');
        const state = parseMapHash('#12/64.14/-21.89/ja/carto');
        expect(state?.zoom).toBe(12);
        expect(state?.lat).toBeCloseTo(64.14, 5);
        expect(state?.basemap).toBe('carto');
    });
});

describe('click detection never queries a killed provider', () => {
    it('filters it out even when the layer state says it is visible', async () => {
        await loadSite('ja');
        const { activeProviderIds } = await import('./mapUrlState');

        // Deliberately inconsistent state — the kind a stale bundle or a
        // devtools edit could produce. Detection must still refuse.
        const ids = activeProviderIds({ jaStreetView: true, googleStreetView: true });
        expect(ids).toEqual(['google']);
    });

    it('passes everything through when nothing is killed', async () => {
        await loadSite();
        const { activeProviderIds } = await import('./mapUrlState');
        const ids = activeProviderIds({ jaStreetView: true, appleLookAround: true });
        expect(ids.sort()).toEqual(['apple', 'ja']);
    });
});

describe('the layer key/slug tables stay in step', () => {
    it('maps every key back to its slug', async () => {
        const { LAYER_SLUGS, LAYER_KEY_TO_SLUG } = await loadUrlState();
        for (const [slug, key] of Object.entries(LAYER_SLUGS)) {
            expect(LAYER_KEY_TO_SLUG[key]).toBe(slug);
        }
    });

    it('covers exactly the providers declared in site.ts', async () => {
        const { PROVIDERS } = await loadSite();
        const { LAYER_SLUGS } = await import('./mapUrlState');
        expect(Object.keys(LAYER_SLUGS).sort()).toEqual(PROVIDERS.map((p) => p.id).sort());
    });
});
