/**
 * site.ts
 *
 * Single source of truth for facts about the deployment that several places
 * need to agree on: the canonical origin, the provider list, and how fresh the
 * coverage data actually is.
 */

/**
 * Canonical origin, used for absolute URLs in metadata, the sitemap and
 * Open Graph tags. Vercel exposes the deployment host but not the production
 * domain, so this is set explicitly rather than inferred.
 */
export const SITE_URL = 'https://streetradar.app';

export const SITE_NAME = 'StreetRadar';

export const SITE_DESCRIPTION =
    'See where Street View imagery exists worldwide. Coverage from Google, Apple Look Around, ' +
    'Bing Streetside, Yandex, Naver and Já 360 on a single map.';

/**
 * When the coverage data was last rebuilt, per provider.
 *
 * This is displayed to visitors. The pipeline has not run since September 2025,
 * and a coverage map that silently presents year-old data as current is worse
 * than one that says how old it is. Update these when a refresh lands.
 */
export const COVERAGE_UPDATED: Record<string, string> = {
    apple: '2025-02',
    ja: '2025-09',
    naver: '2025-09',
};

/** The oldest of the per-provider dates — what the site as a whole can claim. */
export function oldestCoverageDate(): string {
    return Object.values(COVERAGE_UPDATED).sort()[0];
}

/** Renders a YYYY-MM string as "February 2025". */
export function formatCoverageMonth(yearMonth: string): string {
    const [year, month] = yearMonth.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });
}
