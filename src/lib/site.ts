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

/**
 * The providers shown on the map, and — importantly — how each layer is served.
 *
 * `live` layers are requested by the visitor's browser from the provider on
 * demand; nothing is stored here and there is no freshness date to give.
 * `collected` layers are built from coverage we gathered ourselves, so they
 * carry a date from COVERAGE_UPDATED and go stale between pipeline runs.
 *
 * The distinction matters to a visitor trying to work out why one layer is
 * current and another is a year old, so it is stated on the map page rather
 * than left for them to guess.
 */
export interface Provider {
    id: string;
    name: string;
    /** One sentence a visitor who has never heard of it can use. */
    blurb: string;
    source: 'live' | 'collected';
}

export const PROVIDERS: Provider[] = [
    {
        id: 'google',
        name: 'Google Street View',
        blurb: 'The largest network by far, covering most of the road network in over 100 countries.',
        source: 'live',
    },
    {
        id: 'apple',
        name: 'Apple Look Around',
        blurb: "Apple's equivalent, launched in 2019 and still limited to a few dozen countries.",
        source: 'collected',
    },
    {
        id: 'bing',
        name: 'Bing Streetside',
        blurb: "Microsoft's network, concentrated in North America and Western Europe.",
        source: 'live',
    },
    {
        id: 'yandex',
        name: 'Yandex Panoramas',
        blurb: 'The most detailed coverage of Russia, Central Asia and the Caucasus.',
        source: 'live',
    },
    {
        id: 'naver',
        name: 'Naver Street View',
        blurb: 'Dense coverage of South Korea, where Google’s is restricted.',
        source: 'collected',
    },
    {
        id: 'ja',
        name: 'Já 360',
        blurb: 'An Icelandic directory service whose imagery covers 59.6% of the road network.',
        source: 'collected',
    },
];

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
